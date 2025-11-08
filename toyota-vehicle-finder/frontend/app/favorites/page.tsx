'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicleApi } from '@/lib/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (vehicleId: number) => {
    try {
      await vehicleApi.removeFavorite(vehicleId);
      setFavorites(favorites.filter(f => f.vehicle_id !== vehicleId));
    } catch (error) {
      console.error('Error removing favorite:', error);
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
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-toyota-red fill-toyota-red" />
          <h1 className="text-4xl font-bold text-gray-900">My Favorite Vehicles</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Favorites Yet</h2>
              <p className="text-gray-500 mb-6">
                Start exploring vehicles and add your favorites to compare them later!
              </p>
              <Button asChild>
                <a href="/">Browse Vehicles</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {favorite.vehicle && (
                  <>
                    <div className="aspect-video relative bg-gray-200">
                      <img
                        src={favorite.vehicle.image_url}
                        alt={`${favorite.vehicle.model} ${favorite.vehicle.trim}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(favorite.vehicle_id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>{favorite.vehicle.year} {favorite.vehicle.model}</span>
                        <span className="text-2xl font-bold text-toyota-red">
                          ${favorite.vehicle.price.toLocaleString()}
                        </span>
                      </CardTitle>
                      <p className="text-gray-600">{favorite.vehicle.trim}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">MPG:</span>
                          <span className="ml-2 font-medium">{favorite.vehicle.mpg_combined}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Drivetrain:</span>
                          <span className="ml-2 font-medium">{favorite.vehicle.drivetrain}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Engine:</span>
                          <span className="ml-2 font-medium text-xs">{favorite.vehicle.engine}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Seats:</span>
                          <span className="ml-2 font-medium">{favorite.vehicle.seating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {parseFeatures(favorite.vehicle.features).slice(0, 2).map((feature: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Added on {new Date(favorite.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                      <Button variant="outline" asChild>
                        <a href={`/cars/${favorite.vehicle.id}`}>View Details</a>
                      </Button>
                      <Button asChild>
                        <a href={`/finance?vehicle_id=${favorite.vehicle.id}`}>Calculate Payment</a>
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
