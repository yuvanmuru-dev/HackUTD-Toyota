'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Car, Fuel, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vehicleApi, Vehicle, VehicleFilter } from '@/lib/api';

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VehicleFilter>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getVehicles(filters);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search_query: searchQuery });
  };

  const handleFilterChange = (key: keyof VehicleFilter, value: any) => {
    setFilters({ ...filters, [key]: value });
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
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Toyota
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Search from our extensive inventory of quality Toyota vehicles
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by model, trim, or category..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-8">
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Minivan">Minivan</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleFilterChange('drivetrain', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Drivetrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivetrains</SelectItem>
                <SelectItem value="FWD">FWD</SelectItem>
                <SelectItem value="RWD">RWD</SelectItem>
                <SelectItem value="AWD">AWD</SelectItem>
                <SelectItem value="4WD">4WD</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                const [min, max] = value === 'all' ? [undefined, undefined] : value.split('-').map(Number);
                handleFilterChange('min_price', min);
                handleFilterChange('max_price', max);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-30000">Under $30,000</SelectItem>
                <SelectItem value="30000-40000">$30,000 - $40,000</SelectItem>
                <SelectItem value="40000-50000">$40,000 - $50,000</SelectItem>
                <SelectItem value="50000-999999">$50,000+</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleFilterChange('min_mpg', value === 'all' ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Min MPG" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any MPG</SelectItem>
                <SelectItem value="20">20+ MPG</SelectItem>
                <SelectItem value="25">25+ MPG</SelectItem>
                <SelectItem value="30">30+ MPG</SelectItem>
                <SelectItem value="35">35+ MPG</SelectItem>
                <SelectItem value="40">40+ MPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-200">
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.model} ${vehicle.trim}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold">
                    {vehicle.category}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{vehicle.year} {vehicle.model}</span>
                    <span className="text-2xl font-bold text-toyota-red">
                      ${vehicle.price.toLocaleString()}
                    </span>
                  </CardTitle>
                  <p className="text-gray-600">{vehicle.trim}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4 text-gray-400" />
                      <span>{vehicle.mpg_combined} MPG</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span>{vehicle.drivetrain}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>${Math.round(vehicle.price / 60)}/mo</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Key Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {parseFeatures(vehicle.features).slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <a href={`/cars/${vehicle.id}`}>View Details</a>
                  </Button>
                  <Button asChild>
                    <a href={`/finance?vehicle_id=${vehicle.id}`}>Calculate Payment</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No vehicles found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
