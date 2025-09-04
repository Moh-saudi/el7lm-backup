'use client';

import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { CreditCard, Users, Sparkles, Globe, Crown, CheckCircle } from 'lucide-react';

interface PlayerPaymentProps {
  userData: Record<string, unknown>;
  loading: boolean;
}

const PlayerPayment = memo(({ userData, loading }: PlayerPaymentProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Payment System
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg mb-6">
            Experience advanced payment technology with competitive prices and amazing discounts!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <Globe className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-800">Multiple Currencies</div>
              <div className="text-gray-600">Local currency pricing</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Various Payment Methods</div>
              <div className="text-gray-600">Cards, wallets, transfers</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-800">Up to 58% Discount</div>
              <div className="text-gray-600">Save more with annual packages</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-800 mb-3">
              Smart Bulk Payment System
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Pay for your personal subscription or your friends with smart features
            </p>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-purple-200">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700">Smart pricing: Egypt in EGP, Global in local currency</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Multiple payment methods: Cards, Vodafone Cash, STC Pay</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">Smart discounts: 5%-15% for groups, additional payment discount</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-yellow-200">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-700">Fast and secure: Instant activation or within 24 hours</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5" />
                <span className="font-bold">Example: Save 58% with annual package!</span>
              </div>
              <div className="text-sm opacity-90">
                Egypt: 180 EGP/year instead of 360 EGP | Saudi: 188 SAR/year instead of 450 SAR
              </div>
            </div>

            <Link href="/dashboard/player/bulk-payment">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>Start Smart Payment Now</span>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-sm opacity-90 mt-1">
                  Competitive prices  Amazing discounts  Secure payment
                </div>
              </button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              Old Traditional System
            </h3>
            <p className="text-gray-500 mb-6">
              (For comparison only - not recommended)
            </p>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">Fixed prices - no optimization</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">Limited payment methods</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">No group discounts</span>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">Slower processing</span>
              </div>
            </div>

            <div className="bg-gray-200 text-gray-600 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-bold">Higher prices, fewer features</span>
              </div>
              <div className="text-sm">
                Why pay more for less?
              </div>
            </div>

            <Link href="/dashboard/payment">
              <button className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 cursor-not-allowed opacity-75">
                <div className="flex items-center justify-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Old System (not optimized)</span>
                </div>
                <div className="text-sm opacity-75 mt-1">
                  Not recommended  Higher prices  Fewer features
                </div>
              </button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          Why is the new system better?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 text-center border border-green-200">
            <div className="text-2xl mb-2"></div>
            <div className="font-semibold text-green-800">Smart currencies</div>
            <div className="text-gray-600">Local prices for each country</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
            <div className="text-2xl mb-2"></div>
            <div className="font-semibold text-blue-800">Save up to 58%</div>
            <div className="text-gray-600">Tiered and combined discounts</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
            <div className="text-2xl mb-2"></div>
            <div className="font-semibold text-purple-800">Fast payment</div>
            <div className="text-gray-600">Instant subscription activation</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-orange-200">
            <div className="text-2xl mb-2"></div>
            <div className="font-semibold text-orange-800">High security</div>
            <div className="text-gray-600">Advanced data protection</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

PlayerPayment.displayName = 'PlayerPayment';

export default PlayerPayment;
