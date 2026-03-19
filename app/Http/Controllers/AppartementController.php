<?php

namespace App\Http\Controllers;

use App\Models\Appartement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AppartementController extends Controller
{
    public function index(Request $request)
    {
        $query = Appartement::with(["immeuble", "client"])->latest();

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        if ($request->has("search")) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where("numero", "LIKE", "%$search%")
                    ->orWhereHas("immeuble", function ($i) use ($search) {
                        $i->where("nom", "LIKE", "%$search%");
                    })
                    ->orWhereHas("client", function ($c) use ($search) {
                        $c->where("nom", "LIKE", "%$search%");
                    });
            });
        }

        if ($request->filled("statut")) {
            $query->where("statut", $request->statut);
        }

        if ($request->filled("immeuble_id")) {
            $query->where("immeuble_id", $request->immeuble_id);
        }

        if ($request->has("paginate") && $request->paginate == "false") {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "numero" => "required|string|max:255",
            "immeuble_id" => "required|uuid|exists:immeubles,id",
            "etage" => "nullable|integer",
            "surface" => "nullable|numeric|min:0",
            "chambres" => "nullable|integer|min:0",
            "prix_total" => "nullable|numeric|min:0",
            "statut" => [
                "nullable",
                Rule::in(["disponible", "vendu", "reserve"]),
            ],
            "description" => "nullable|string",
            "client_id" => "nullable|uuid|exists:clients,id",
            "files" => "nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240",
        ]);

        if ($request->hasFile("files")) {
            $paths = [];
            foreach ($request->file("files") as $file) {
                $paths[] = $file->store("appartement_documents", "public");
            }
            $validated["documents"] = json_encode($paths);
        }

        $appartement = Appartement::create($validated);
        $appartement->load(["immeuble", "client"]);

        return response()->json($appartement, 201);
    }

    public function show(Appartement $appartement)
    {
        $appartement->load(["creator", "immeuble.terrain", "client", "contracts.milestones", "paiements.milestone"]);

        $payload = $appartement->toArray();

        $payload["creator"] = $appartement->creator
            ? [
                "id" => $appartement->creator->id,
                "full_name" => $appartement->creator->name,
                "email" => $appartement->creator->email,
            ]
            : null;

        $documents = $appartement->documents
            ? json_decode($appartement->documents, true)
            : [];
        $documentUrls = collect($documents)
            ->map(function ($path) {
                return Storage::url($path);
            })
            ->all();

        $payload["documents"] = $documentUrls;

        return response()->json($payload);
    }

    public function update(Request $request, Appartement $appartement)
    {
        $validated = $request->validate([
            "numero" => "sometimes|required|string|max:255",
            "immeuble_id" => "sometimes|required|uuid|exists:immeubles,id",
            "etage" => "nullable|integer",
            "surface" => "nullable|numeric|min:0",
            "chambres" => "nullable|integer|min:0",
            "prix_total" => "nullable|numeric|min:0",
            "statut" => [
                "sometimes",
                Rule::in(["disponible", "vendu", "reserve"]),
            ],
            "description" => "nullable|string",
            "client_id" => "nullable|uuid|exists:clients,id",
            "files" => "sometimes|nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240",
        ]);

        if ($request->hasFile("files")) {
            $existing = $appartement->documents
                ? json_decode($appartement->documents, true)
                : [];
            foreach ($request->file("files") as $file) {
                $existing[] = $file->store("appartement_documents", "public");
            }
            $validated["documents"] = json_encode($existing);
        }

        $appartement->update($validated);
        $appartement->load(["immeuble", "client"]);

        return response()->json($appartement);
    }

    public function destroy(Appartement $appartement)
    {
        if (!Auth::user()->hasRole("admin")) {
            return response()->json(
                [
                    "message" =>
                        "Seul un administrateur peut supprimer un appartement.",
                ],
                403,
            );
        }

        $appartement->delete();

        return response()->json(null, 204);
    }

    public function documents(string $id)
    {
        $appartement = Appartement::findOrFail($id);

        $paths = $appartement->documents
            ? json_decode($appartement->documents, true)
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

    public function deleteDocument(Request $request, Appartement $appartement)
    {
        $request->validate([
            "file_url" => "required|string",
        ]);

        $fileUrl = $request->input("file_url");

        $path = str_replace("/storage/", "", parse_url($fileUrl, PHP_URL_PATH));

        $documents = $appartement->documents
            ? json_decode($appartement->documents, true)
            : [];

        if (($key = array_search($path, $documents)) !== false) {
            unset($documents[$key]);

            $documents = array_values($documents);

            if (Storage::disk("public")->exists($path)) {
                Storage::disk("public")->delete($path);
            }

            $appartement->update([
                "documents" => json_encode($documents),
            ]);

            return response()->json([
                "message" => "Document deleted successfully",
            ]);
        }

        return response()->json(["message" => "Document not found"], 404);
    }
}
