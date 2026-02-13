'use client';

import { useState } from 'react';
import { Download, Printer, Share2, MessageCircle, ChevronDown, FileText, X } from 'lucide-react';
import { generateThermalPDF, shareOnWhatsApp, shareViaNativeShare, ThermalContent, ShareContent } from '@/lib/exportUtils';

interface ExportButtonsProps {
  // PDF A4 export function (existing)
  onExportPDFA4: () => void;
  
  // Thermal print content
  thermalContent: ThermalContent;
  thermalTitle: string;
  thermalFilename: string;
  
  // WhatsApp/Share content
  shareContent: ShareContent;
  
  // Optional: Custom labels
  pdfLabel?: string;
  
  // Optional: Disable certain options
  disableThermal?: boolean;
  disableWhatsApp?: boolean;
}

export default function ExportButtons({
  onExportPDFA4,
  thermalContent,
  thermalTitle,
  thermalFilename,
  shareContent,
  pdfLabel = 'Download PDF',
  disableThermal = false,
  disableWhatsApp = false,
}: ExportButtonsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleThermalPrint = () => {
    generateThermalPDF(thermalTitle, thermalContent, thermalFilename);
    setShowDropdown(false);
  };

  const handleWhatsAppShare = () => {
    shareOnWhatsApp(shareContent);
    setShowShareOptions(false);
  };

  const handleNativeShare = async () => {
    await shareViaNativeShare(shareContent);
    setShowShareOptions(false);
  };

  // Close dropdowns when clicking outside
  const handleOverlayClick = () => {
    setShowDropdown(false);
    setShowShareOptions(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Export Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* PDF A4 Export Button */}
        <button
          onClick={onExportPDFA4}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[48px] touch-manipulation"
        >
          <FileText className="w-5 h-5" />
          <span className="text-sm sm:text-base">{pdfLabel} (A4)</span>
        </button>

        {/* Thermal Print Button */}
        {!disableThermal && (
          <button
            onClick={handleThermalPrint}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[48px] touch-manipulation"
          >
            <Printer className="w-5 h-5" />
            <span className="text-sm sm:text-base">Thermal 80mm</span>
          </button>
        )}

        {/* Share Button with Options */}
        {!disableWhatsApp && (
          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[48px] touch-manipulation"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm sm:text-base">Share</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showShareOptions ? 'rotate-180' : ''}`} />
            </button>

            {/* Share Options Dropdown */}
            {showShareOptions && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={handleOverlayClick}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">WhatsApp</p>
                        <p className="text-xs text-gray-500">Share via WhatsApp</p>
                      </div>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Share...</p>
                        <p className="text-xs text-gray-500">More sharing options</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          📄 A4: Standard PDF • 🖨️ Thermal: 80mm receipt • 📱 Share: WhatsApp & more
        </p>
      </div>
    </div>
  );
}

// ============================================
// COMPACT EXPORT BUTTON (Single Dropdown)
// ============================================

interface CompactExportButtonProps {
  onExportPDFA4: () => void;
  thermalContent: ThermalContent;
  thermalTitle: string;
  thermalFilename: string;
  shareContent: ShareContent;
  buttonLabel?: string;
}

export function CompactExportButton({
  onExportPDFA4,
  thermalContent,
  thermalTitle,
  thermalFilename,
  shareContent,
  buttonLabel = 'Export & Share',
}: CompactExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handlePDFA4 = () => {
    onExportPDFA4();
    setShowMenu(false);
  };

  const handleThermal = () => {
    generateThermalPDF(thermalTitle, thermalContent, thermalFilename);
    setShowMenu(false);
  };

  const handleWhatsApp = () => {
    shareOnWhatsApp(shareContent);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] touch-manipulation"
      >
        <Download className="w-5 h-5" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Export Options</span>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Close menu"
                aria-label="Close export menu"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="p-2">
              {/* PDF A4 */}
              <button
                onClick={handlePDFA4}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">PDF (A4)</p>
                  <p className="text-xs text-gray-500">Standard document format</p>
                </div>
              </button>

              {/* Thermal Print */}
              <button
                onClick={handleThermal}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Thermal Print (80mm)</p>
                  <p className="text-xs text-gray-500">Receipt printer format</p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Share on WhatsApp</p>
                  <p className="text-xs text-gray-500">Send to patient/colleague</p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                For Healthcare Professionals Only
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
