/**
 * Static warehouse location options.
 * Shape mirrors the expected response from the PROD /warehouse-locations endpoint.
 * Field names must stay in sync with warehouseLocation.types.ts — do not rename
 * without updating warehouseLocationsApi.ts and the type definitions.
 */

export interface WarehouseLocation {
  id: string;
  label: string;
}

export const warehouseLocations: WarehouseLocation[] = [
  { id: "WH-BOSTON-01",  label: "WH-BOSTON-01"  },
  { id: "WH-CHICAGO-02", label: "WH-CHICAGO-02" },
  { id: "WH-DALLAS-03",  label: "WH-DALLAS-03"  },
  { id: "WH-SEATTLE-04", label: "WH-SEATTLE-04" },
  { id: "WH-MIAMI-05",   label: "WH-MIAMI-05"   },
  { id: "WH-DENVER-06",  label: "WH-DENVER-06"  },
  { id: "WH-PHOENIX-07", label: "WH-PHOENIX-07" },
  { id: "WH-TORONTO-08", label: "WH-TORONTO-08" },
];
