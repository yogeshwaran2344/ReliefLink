// Module 4: Surplus Redistribution Engine
// Balances stock across warehouses based on regional buffer requirements

export function computeSurplusRedistribution(warehouses, camps) {
  const recommendations = [];

  // Define warehouse regional service zones
  // Alpha: Central & South (Camps A, C, D)
  // Beta: North (Camps B, E)
  // Gamma: Coastal (Camps A, C, E)

  const items = ['food', 'water', 'medical'];

  items.forEach(item => {
    // Determine each warehouse's net surplus or deficit relative to minimum threshold + demand buffer
    const profiles = warehouses.map(wh => {
      const stockItem = wh.stock[item];
      const available = stockItem.available;
      const threshold = stockItem.minThreshold;

      // Net balance above required threshold
      const net = available - threshold;
      return {
        warehouseId: wh.id,
        warehouseName: wh.name,
        available,
        threshold,
        net,
        unit: stockItem.unit,
        unitWeightKg: stockItem.unitWeightKg || 1
      };
    });

    const surplusWarehouses = profiles.filter(p => p.net > 0).sort((a, b) => b.net - a.net);
    const deficitWarehouses = profiles.filter(p => p.net < 0).sort((a, b) => a.net - b.net);

    surplusWarehouses.forEach(donor => {
      deficitWarehouses.forEach(recipient => {
        if (donor.net > 0 && recipient.net < 0) {
          const transferable = Math.min(donor.net, Math.abs(recipient.net));
          if (transferable > 15) {
            const transferWeightKg = Math.round(transferable * donor.unitWeightKg);
            recommendations.push({
              id: `redist-${donor.warehouseId}-${recipient.warehouseId}-${item}`,
              item,
              itemDisplayName: item === 'food' ? 'Food Packets' : item === 'water' ? 'Drinking Water' : 'Medical Kits',
              donorId: donor.warehouseId,
              donorName: donor.warehouseName,
              donorAvailable: donor.available,
              donorSurplus: donor.net,
              recipientId: recipient.warehouseId,
              recipientName: recipient.warehouseName,
              recipientDeficit: Math.abs(recipient.net),
              recommendedTransferQty: transferable,
              unit: donor.unit,
              transferWeightKg,
              recommendedVehicleType: transferWeightKg > 700 ? 'Heavy Truck RL-01' : 'All-Terrain 4x4 RL-02',
              estimatedTransitHours: 1.2,
              impactSummary: `Relieves critical stockout risk at ${recipient.warehouseName} by relocating ${transferable} ${donor.unit} from surplus buffer at ${donor.warehouseName}.`
            });

            donor.net -= transferable;
            recipient.net += transferable;
          }
        }
      });
    });
  });

  return recommendations;
}
