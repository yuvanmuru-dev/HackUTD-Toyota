'use client';

import { useState, useEffect } from 'react';
import { Calculator, Car, DollarSign, Percent, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vehicleApi, Vehicle, FinanceRequest } from '@/lib/api';

export default function FinancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [financeData, setFinanceData] = useState<FinanceRequest>({
    vehicle_price: 35000,
    down_payment: 0,
    trade_in_value: 0,
    interest_rate: 4.5,
    loan_term_months: 60,
    include_tax: true,
    tax_rate: 8.25,
    include_fees: true,
    fees: 500,
  });
  const [result, setResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadVehicles();
    // Check if vehicle_id is in query params
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get('vehicle_id');
    if (vehicleId) {
      loadVehicle(parseInt(vehicleId));
    }
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadVehicle = async (id: number) => {
    try {
      const vehicle = await vehicleApi.getVehicle(id);
      setSelectedVehicle(vehicle);
      setFinanceData({ ...financeData, vehicle_price: vehicle.price });
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const response = await vehicleApi.calculateFinance(financeData);
      setResult(response);
    } catch (error) {
      console.error('Error calculating finance:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFinanceData({ ...financeData, vehicle_price: vehicle.price });
    }
  };

  const handleInputChange = (key: keyof FinanceRequest, value: any) => {
    setFinanceData({ ...financeData, [key]: value });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Finance Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Your Monthly Payment</CardTitle>
                <CardDescription>
                  Enter your financing details to estimate your monthly payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vehicle Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Vehicle</label>
                  <Select onValueChange={handleVehicleSelect} value={selectedVehicle?.id.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.year} {vehicle.model} {vehicle.trim} - ${vehicle.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      className="pl-10"
                      value={financeData.vehicle_price}
                      onChange={(e) => handleInputChange('vehicle_price', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Down Payment */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Down Payment</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        className="pl-10"
                        value={financeData.down_payment}
                        onChange={(e) => handleInputChange('down_payment', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Trade-in Value */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trade-in Value</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        className="pl-10"
                        value={financeData.trade_in_value}
                        onChange={(e) => handleInputChange('trade_in_value', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Interest Rate (APR %)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        step="0.1"
                        className="pl-10"
                        value={financeData.interest_rate}
                        onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Loan Term</label>
                    <Select 
                      onValueChange={(value) => handleInputChange('loan_term_months', parseInt(value))}
                      value={financeData.loan_term_months.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                        <SelectItem value="72">72 months</SelectItem>
                        <SelectItem value="84">84 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Additional Costs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-tax"
                        checked={financeData.include_tax}
                        onChange={(e) => handleInputChange('include_tax', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="include-tax" className="text-sm">
                        Include Sales Tax ({financeData.tax_rate}%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-fees"
                        checked={financeData.include_fees}
                        onChange={(e) => handleInputChange('include_fees', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="include-fees" className="text-sm">
                        Include Fees (${financeData.fees})
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCalculate} 
                  className="w-full"
                  disabled={calculating}
                >
                  {calculating ? 'Calculating...' : 'Calculate Payment'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-1">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Financing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-toyota-red text-white rounded-lg">
                    <div className="text-sm uppercase tracking-wide mb-2">Monthly Payment</div>
                    <div className="text-4xl font-bold">
                      ${result.monthly_payment.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vehicle Price</span>
                      <span className="font-medium">
                        ${result.breakdown.vehicle_price.toLocaleString()}
                      </span>
                    </div>
                    {result.breakdown.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sales Tax</span>
                        <span className="font-medium">
                          ${result.breakdown.tax.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {result.breakdown.fees > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fees</span>
                        <span className="font-medium">
                          ${result.breakdown.fees.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-medium text-green-600">
                        -${result.breakdown.down_payment.toLocaleString()}
                      </span>
                    </div>
                    {result.breakdown.trade_in_value > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trade-in Value</span>
                        <span className="font-medium text-green-600">
                          -${result.breakdown.trade_in_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Financed Amount</span>
                        <span>${result.total_loan_amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Interest</span>
                        <span className="font-medium">
                          ${result.total_interest_paid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Total Amount Paid</span>
                        <span className="font-medium">
                          ${result.total_amount_paid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedVehicle && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={selectedVehicle.image_url}
                    alt={`${selectedVehicle.model} ${selectedVehicle.trim}`}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold">
                    {selectedVehicle.year} {selectedVehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedVehicle.trim}</p>
                  <p className="text-lg font-bold text-toyota-red mt-2">
                    ${selectedVehicle.price.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
