import axios from "axios";
import { Terrain, Immeuble, Appartement } from "../types";

export const inventoryService = {
    async getAvailableAssets(): Promise<{
        terrains: Terrain[];
        immeubles: Immeuble[];
        appartements: Appartement[];
    }> {
        const [terrains, immeubles, appartements] = await Promise.all([
            axios.get("/api/terrains?statut=disponible&paginate=false"),
            axios.get("/api/immeubles?statut=disponible&paginate=false"),
            axios.get("/api/appartements?statut=disponible&paginate=false"),
        ]);

        return {
            terrains: terrains.data,
            immeubles: immeubles.data,
            appartements: appartements.data,
        };
    },
};
