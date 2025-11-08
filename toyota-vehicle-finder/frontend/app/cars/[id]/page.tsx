'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Car, Fuel, DollarSign, Shield, Users, Package, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicleApi, Vehicle } from '@/lib/api';

export default function VehicleDetailPage() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadVehicle(Number(params.id));
    }
  }, [params.id]);

  const loadVehicle = async (id: number) => {
    try {
      setLoading(true);
      const data = await vehicleApi.getVehicle(id);
      setVehicle(data);
      await vehicleApi.addToHistory(id);
      checkFavorite(id);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async (vehicleId: number) => {
    try {
      const favorites = await vehicleApi.getFavorites();
      setIsFavorite(favorites.some((f: any) => f.vehicle_id === vehicleId));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!vehicle) return;
    
    try {
      if (isFavorite) {
        await vehicleApi.removeFavorite(vehicle.id);
      } else {
        await vehicleApi.addFavorite(vehicle.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const parseFeatures = (features: string): string[] => {
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
            <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist.</p>
            <Button asChild>
              <a href="/">Return to Search</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{vehicle.model} {vehicle.trim}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="overflow-hidden mb-6">
              <div className="aspect-video relative">
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.model} ${vehicle.trim}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
              </div>
            </Card>

            {/* Vehicle Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Vehicle Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engine</span>
                        <span className="font-medium">{vehicle.engine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transmission</span>
                        <span className="font-medium">{vehicle.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drivetrain</span>
                        <span className="font-medium">{vehicle.drivetrain}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Fuel Economy</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">City</span>
                        <span className="font-medium">{vehicle.mpg_city} MPG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Highway</span>
                        <span className="font-medium">{vehicle.mpg_highway} MPG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Combined</span>
                        <span className="font-medium">{vehicle.mpg_combined} MPG</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Capacity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seating</span>
                        <span className="font-medium">{vehicle.seating} passengers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cargo Volume</span>
                        <span className="font-medium">{vehicle.cargo_volume} cu ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Towing Capacity</span>
                        <span className="font-medium">
                          {vehicle.towing_capacity > 0 ? `${vehicle.towing_capacity.toLocaleString()} lbs` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Safety</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety Rating</span>
                        <span className="font-medium">{vehicle.safety_rating}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parseFeatures(vehicle.features).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-toyota-red rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <Card className="mb-6 sticky top-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{vehicle.year} {vehicle.model}</h2>
                    <p className="text-lg text-gray-600">{vehicle.trim}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                    {vehicle.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-toyota-red">
                  ${vehicle.price.toLocaleString()}
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div className="text-center">
                    <Fuel className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                    <div className="text-sm text-gray-600">Combined</div>
                    <div className="font-semibold">{vehicle.mpg_combined} MPG</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                    <div className="text-sm text-gray-600">Seating</div>
                    <div className="font-semibold">{vehicle.seating}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <a href={`/finance?vehicle_id=${vehicle.id}`}>
                      Calculate Payment
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/compare">
                      Compare Vehicles
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </div>

                <div className="text-sm text-gray-500 text-center pt-2">
                  Estimated monthly payment from
                  <div className="text-lg font-semibold text-gray-900">
                    ${Math.round(vehicle.price / 60)}/mo
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
