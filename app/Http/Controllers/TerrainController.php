<?php

namespace App\Http\Controllers;

use App\Models\Terrain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TerrainController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // BelongsToAgency trait automatically scopes this to the current agency
        $query = Terrain::with('creator')->latest();

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('nom_projet', 'like', "%{$s}%")
                  ->orWhere('ville', 'like', "%{$s}%")
                  ->orWhere('quartier', 'like', "%{$s}%");
            });
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('ville')) {
            $query->where('ville', $request->ville);
        }

        if ($request->get('paginate') === 'false') {
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
            "nom_projet" => "required|string|max:255",
            "ville" => "required|string|max:255",
            "quartier" => "nullable|string|max:255",
            "surface" => "nullable|numeric|min:0",
            "prix_achat" => "nullable|numeric|min:0",
            "statut" => [
                "nullable",
                Rule::in(["disponible", "vendu", "reserve", "en_cours"]),
            ],
            // New optional fields
            "description" => "nullable|string",
            "files" => "nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240", // max 10 MB each
        ]);

        // Handle multiple file uploads
        if ($request->hasFile("files")) {
            $paths = [];
            foreach ($request->file("files") as $file) {
                // Store on the "public" disk so files are reachable via the /storage symlink
                $paths[] = $file->store("terrain_documents", "public");
            }
            // Store JSON-encoded list of paths
            $validated["documents"] = json_encode($paths);
        }

        $terrain = Terrain::create($validated);

        return response()->json($terrain, 201);
    }

    /**
     * Display the specified resource, including creator information.
     */
    public function show(Terrain $terrain)
    {
        // Load relationships
        $terrain->load(['creator', 'immeubles.appartements']);

        // Convert the model to an array so we can add extra data
        $payload = $terrain->toArray();

        // Append a friendly creator object (id, full_name, email)
        $payload["creator"] = $terrain->creator
            ? [
                "id" => $terrain->creator->id,
                "full_name" => $terrain->creator->name,
                "email" => $terrain->creator->email,
            ]
            : null;

        // Decode stored document paths and generate public URLs
        $documents = $terrain->documents
            ? json_decode($terrain->documents, true)
            : [];
        $documentUrls = collect($documents)
            ->map(function ($path) {
                return Storage::url($path);
            })
            ->all();

        // Replace the raw documents field with the public URLs array
        $payload["documents"] = $documentUrls;
        
        // Add immeubles count
        $payload["immeubles_count"] = $terrain->immeubles->count();
        
        // Add total units (appartements) count
        $payload["appartements_count"] = $terrain->immeubles->sum(function($immeuble) {
            return $immeuble->appartements->count();
        });

        return response()->json($payload);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Terrain $terrain)
    {
        $validated = $request->validate([
            "nom_projet" => "sometimes|required|string|max:255",
            "ville" => "sometimes|required|string|max:255",
            "quartier" => "nullable|string|max:255",
            "surface" => "nullable|numeric|min:0",
            "prix_achat" => "nullable|numeric|min:0",
            "statut" => [
                "sometimes",
                Rule::in(["disponible", "vendu", "reserve", "en_cours"]),
            ],
            // New optional fields
            "description" => "sometimes|nullable|string",
            "files" => "sometimes|nullable|array",
            "files.*" => "file|mimes:pdf,jpeg,png,jpg,gif,svg|max:10240",
        ]);

        // Handle new file uploads if present
        if ($request->hasFile("files")) {
            $existing = $terrain->documents
                ? json_decode($terrain->documents, true)
                : [];
            foreach ($request->file("files") as $file) {
                // Store on the "public" disk so files are reachable via the /storage symlink
                $existing[] = $file->store("terrain_documents", "public");
            }
            $validated["documents"] = json_encode($existing);
        }

        $terrain->update($validated);

        return response()->json($terrain);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Terrain $terrain)
    {
        if (!Auth::user()->hasRole("admin")) {
            return response()->json(
                [
                    "message" =>
                        "Seul un administrateur peut supprimer un terrain.",
                ],
                403,
            );
        }

        $terrain->delete();

        return response()->json(null, 204);
    }

    /**
     * Return download URLs for the documents attached to a terrain.
     *
     * GET /api/terrains/{id}/documents
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function documents(string $id)
    {
        $terrain = Terrain::findOrFail($id);

        // The `documents` column stores a JSON‑encoded array of relative paths.
        $paths = $terrain->documents
            ? json_decode($terrain->documents, true)
            : [];

        // Build public URLs.  Files are stored on the "public" disk
        // (e.g. storage/app/public/terrain_documents/…) and are
        // reachable via the `storage` symlink.
        $urls = collect($paths)
            ->map(function ($path) {
                // If you ever store files on a different disk, adjust the
                // disk name here (e.g. Storage::disk('s3')->url($path))
                return Storage::url($path);
            })
            ->all();

        return response()->json([
            "documents" => $urls,
        ]);
    }

    /**
     * Remove a specific document from a terrain.
     */
    public function deleteDocument(Request $request, Terrain $terrain)
    {
        $request->validate([
            'file_url' => 'required|string',
        ]);

        $fileUrl = $request->input('file_url');
        
        // Extract the path from the URL 
        // Example URL: /storage/terrain_documents/xyz.jpg -> terrain_documents/xyz.jpg
        $path = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));

        $documents = $terrain->documents ? json_decode($terrain->documents, true) : [];
        
        // Find and remove the path from the array
        if (($key = array_search($path, $documents)) !== false) {
            unset($documents[$key]);
            
            // Re-index array
            $documents = array_values($documents);
            
            // Delete actual file from storage
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            
            // Update the terrain record
            $terrain->update([
                'documents' => json_encode($documents)
            ]);
            
            return response()->json(['message' => 'Document deleted successfully']);
        }
        
        return response()->json(['message' => 'Document not found'], 404);
    }
}
