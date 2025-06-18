import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react';
export default function unauthorized() {
    const Navigate = useNavigate();
    const location = useLocation();
  return (

 <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Accès Refusé</h1>
        
        
        <div className="border-t border-gray-200 pt-6 mb-6"></div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            <span>Retour</span>
          </button>
          
          <button 
            className="w-full py-2 px-4 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => Navigate("/login")}
          >
            Connexion
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-8">
          Si vous avez besoin d'aide immédiate, veuillez contacter le support à <span className="text-blue-600">support@entreprise.com</span>
        </p>
      </div>
    </div>
  );
}
