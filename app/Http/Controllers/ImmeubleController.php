<?php

namespace App\Http\Controllers;

use App\Models\Immeuble;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ImmeubleController extends Controller
{
    public function index(Request $request)
    {
        $query = Immeuble::with("terrain")->latest();

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        if ($request->has("search")) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where("nom", "LIKE", "%$search%")->orWhereHas(
                    "terrain",
                    function ($t) use ($search) {
                        $t->where("nom_projet", "LIKE", "%$search%");
                    },
                );
            });
        }

        // Removed statut filter to allow fetching all immeubles regardless of status.
        // if ($request->filled("statut")) {
        //     $query->where("statut", $request->statut);
        // }

        if ($request->filled("ville")) {
            $query->whereHas("terrain", function ($t) use ($request) {
                $t->where("ville", $request->ville);
            });
        }

        // If paginate=false is requested, return a plain array instead of paginated data
        if ($request->has("paginate") && $request->paginate == "false") {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            "nom" => "required|string|max:255",
            "terrain_id" => "nullable|uuid|exists:terrains,id",
            "nombre_etages" => "nullable|integer|min:0",
            "statut" => [
                "nullable",
                Rule::in(["sur_plan", "en_construction", "livre"]),
            ],
            "date_debut" => "nullable|date",
            "date_livraison" => "nullable|date|after_or_equal:date_debut",
            "description" => "nullable|string",
            "files" => "nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240",
        ]);

        if ($request->hasFile("files")) {
            $paths = [];
            foreach ($request->file("files") as $file) {
                $paths[] = $file->store("immeuble_documents", "public");
            }
            $validated["documents"] = json_encode($paths);
        }

        $immeuble = Immeuble::create($validated);
        $immeuble->load("terrain");

        return response()->json($immeuble, 201);
    }

    /**
     * Display the specified resource, including creator information.
     */
    public function show(Immeuble $immeuble)
    {
        $immeuble->load(["creator", "terrain", "appartements"]);

        $payload = $immeuble->toArray();

        $payload["creator"] = $immeuble->creator
            ? [
                "id" => $immeuble->creator->id,
                "full_name" => $immeuble->creator->name,
                "email" => $immeuble->creator->email,
            ]
            : null;

        $payload["appartements_count"] = $immeuble->appartements->count();
        $payload["appartements_vendus"] = $immeuble->appartements
            ->whereIn("statut", ["vendu", "reserve"])
            ->count();

        $documents = $immeuble->documents
            ? json_decode($immeuble->documents, true)
            : [];
        $documentUrls = collect($documents)
            ->map(function ($path) {
                return Storage::url($path);
            })
            ->all();

        $payload["documents"] = $documentUrls;

        return response()->json($payload);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Immeuble $immeuble)
    {
        $validated = $request->validate([
            "nom" => "sometimes|required|string|max:255",
            "terrain_id" => "nullable|uuid|exists:terrains,id",
            "nombre_etages" => "nullable|integer|min:0",
            "statut" => [
                "sometimes",
                Rule::in(["sur_plan", "en_construction", "livre"]),
            ],
            "date_debut" => "nullable|date",
            "date_livraison" => "nullable|date|after_or_equal:date_debut",
            "description" => "sometimes|nullable|string",
            "files" => "sometimes|nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240",
        ]);

        if ($request->hasFile("files")) {
            $existing = $immeuble->documents
                ? json_decode($immeuble->documents, true)
                : [];
            foreach ($request->file("files") as $file) {
                $existing[] = $file->store("immeuble_documents", "public");
            }
            $validated["documents"] = json_encode($existing);
        }

        $immeuble->update($validated);
        $immeuble->load("terrain");

        return response()->json($immeuble);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Immeuble $immeuble)
    {
        if (!Auth::user()->hasRole("admin")) {
            return response()->json(
                [
                    "message" =>
                        "Seul un administrateur peut supprimer un immeuble.",
                ],
                403,
            );
        }

        $immeuble->delete();

        return response()->json(null, 204);
    }

    public function documents(string $id)
    {
        $immeuble = Immeuble::findOrFail($id);

        $paths = $immeuble->documents
            ? json_decode($immeuble->documents, true)
            : [];

        $urls = collect($paths)
            ->map(function ($path) {
                return Storage::url($path);
            })
            ->all();

        return response()->json([
            "documents" => $urls,
        ]);
    }

    public function deleteDocument(Request $request, Immeuble $immeuble)
    {
        $request->validate([
            "file_url" => "required|string",
        ]);

        $fileUrl = $request->input("file_url");

        $path = str_replace("/storage/", "", parse_url($fileUrl, PHP_URL_PATH));

        $documents = $immeuble->documents
            ? json_decode($immeuble->documents, true)
            : [];

        if (($key = array_search($path, $documents)) !== false) {
            unset($documents[$key]);

            $documents = array_values($documents);

            if (Storage::disk("public")->exists($path)) {
                Storage::disk("public")->delete($path);
            }

            $immeuble->update([
                "documents" => json_encode($documents),
            ]);

            return response()->json([
                "message" => "Document deleted successfully",
            ]);
        }

        return response()->json(["message" => "Document not found"], 404);
    }
}
