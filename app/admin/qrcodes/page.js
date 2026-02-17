'use client';

import { useState, useEffect, useRef } from 'react';

export default function QRCodesPage() {
  const [tablets, setTablets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});
  const [appUrl, setAppUrl] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    setAppUrl(baseUrl);

    const fetchTablets = async () => {
      try {
        const res = await fetch('/api/tablets');
        const data = await res.json();
        setTablets(data.tablets || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTablets();
  }, []);

  // Generate QR codes after tablets are loaded
  useEffect(() => {
    if (tablets.length === 0 || !appUrl) return;

    const generateQRCodes = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const codes = {};

        for (const tablet of tablets) {
          const url = `${appUrl}/tablet/${tablet.id}`;
          codes[tablet.id] = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
              dark: '#1e293b',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          });
        }

        setQrCodes(codes);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    };

    generateQRCodes();
  }, [tablets, appUrl]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-blue-600 border-t-transparent w-10 h-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QR Codes</h2>
          <p className="text-gray-500 text-sm mt-1">Print and stick on each tablet</p>
        </div>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print All QR Codes
        </button>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-100 no-print">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">How to use</h4>
            <ol className="text-blue-700 text-sm mt-1 space-y-1 list-decimal list-inside">
              <li>Click "Print All QR Codes" to print this page</li>
              <li>Cut out each QR code card</li>
              <li>Stick the matching QR code on the back of each tablet</li>
              <li>Members scan with their phone camera to check out / return</li>
            </ol>
          </div>
        </div>
      </div>

      {/* App URL Info */}
      <div className="card no-print">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">App URL (used in QR codes)</h4>
        <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm text-gray-600 break-all">
          {appUrl}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Each QR code links to: {appUrl}/tablet/[tablet-number]
        </p>
      </div>

      {/* QR Code Grid */}
      <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tablets.map(tablet => (
          <div key={tablet.id} className="card text-center">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6">
              {/* QR Code Image */}
              {qrCodes[tablet.id] ? (
                <img
                  src={qrCodes[tablet.id]}
                  alt={`QR Code for ${tablet.name}`}
                  className="w-48 h-48 mx-auto mb-4"
                />
              ) : (
                <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="spinner border-gray-400 border-t-transparent w-8 h-8"></div>
                </div>
              )}

              {/* Tablet Info */}
              <h3 className="text-xl font-bold text-gray-900">{tablet.name}</h3>
              <p className="text-sm text-gray-400 mt-1">+ Pen</p>

              {/* URL */}
              <p className="text-xs text-gray-300 mt-3 font-mono break-all">
                {appUrl}/tablet/{tablet.id}
              </p>

              {/* HR Department Label */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  HR Department
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Scan to check out / return
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print Footer */}
      <div className="text-center text-xs text-gray-400 no-print">
        <p>Tip: For best results, print on sticker paper or laminate the QR codes</p>
      </div>
    </div>
  );
}
