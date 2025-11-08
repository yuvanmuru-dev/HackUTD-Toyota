'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vehicleApi, Vehicle, ComparisonResponse } from '@/lib/api';

export default function ComparePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<(Vehicle | null)[]>([null, null, null]);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleVehicleSelect = (index: number, vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      const newSelection = [...selectedVehicles];
      newSelection[index] = vehicle;
      setSelectedVehicles(newSelection);
    }
  };

  const handleRemoveVehicle = (index: number) => {
    const newSelection = [...selectedVehicles];
    newSelection[index] = null;
    setSelectedVehicles(newSelection);
    setComparisonData(null);
  };

  const handleCompare = async () => {
    const validVehicles = selectedVehicles.filter(v => v !== null) as Vehicle[];
    if (validVehicles.length < 2) {
      alert('Please select at least 2 vehicles to compare');
      return;
    }

    try {
      setLoading(true);
      const vehicleIds = validVehicles.map(v => v.id);
      const response = await vehicleApi.compareVehicles(vehicleIds);
      setComparisonData(response);
    } catch (error) {
      console.error('Error comparing vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseFeatures = (features: string): string[] => {
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Compare Vehicles</h1>
        
        {/* Vehicle Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">Vehicle {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVehicles[index] ? (
                  <div>
                    <button
                      onClick={() => handleRemoveVehicle(index)}
                      className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <img
                      src={selectedVehicles[index]!.image_url}
                      alt={`${selectedVehicles[index]!.model} ${selectedVehicles[index]!.trim}`}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold">
                      {selectedVehicles[index]!.year} {selectedVehicles[index]!.model}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedVehicles[index]!.trim}</p>
                    <p className="text-lg font-bold text-toyota-red mt-2">
                      ${selectedVehicles[index]!.price.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Select onValueChange={(value) => handleVehicleSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles
                          .filter(v => !selectedVehicles.some(sv => sv?.id === v.id))
                          .map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.year} {vehicle.model} {vehicle.trim}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Choose a vehicle to compare</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-8">
          <Button 
            onClick={handleCompare} 
            size="lg"
            disabled={selectedVehicles.filter(v => v !== null).length < 2 || loading}
          >
            {loading ? 'Comparing...' : 'Compare Vehicles'}
          </Button>
        </div>

        {/* Comparison Results */}
        {comparisonData && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Feature</th>
                      {comparisonData.vehicles.map((vehicle) => (
                        <th key={vehicle.id} className="p-4 text-center">
                          <div>
                            <div className="font-semibold">{vehicle.model}</div>
                            <div className="text-sm text-gray-600">{vehicle.trim}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparisonData.comparison_table).map(([key, values]) => (
                      <tr key={key} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{key}</td>
                        {values.map((value, idx) => (
                          <td key={idx} className="p-4 text-center">
                            {typeof value === 'string' && value.includes('$') ? (
                              <span className="font-semibold text-toyota-red">{value}</span>
                            ) : (
                              value
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">Key Features</td>
                      {comparisonData.vehicles.map((vehicle) => (
                        <td key={vehicle.id} className="p-4">
                          <ul className="text-sm space-y-1">
                            {parseFeatures(vehicle.features).slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <Check className="h-3 w-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                                <span className="text-xs">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {comparisonData.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="text-center">
                    <Button asChild className="w-full" variant="outline">
                      <a href={`/finance?vehicle_id=${vehicle.id}`}>
                        Calculate Payment
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
