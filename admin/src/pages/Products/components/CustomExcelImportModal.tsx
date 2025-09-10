import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { importFromExcel } from '../../../services/customExcelImportService';
import { Icon } from '@iconify/react';

interface CustomExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CustomExcelImportModal: React.FC<CustomExcelImportModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      return importFromExcel(file);
    },
    onSuccess: (data) => {
      if (data.success) {
        onSuccess?.();
        // Don't close the modal automatically - let user see the results
      }
    },
  });

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please select a file to analyze');
      return;
    }

    importMutation.mutate(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#232b42] rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            📊 Custom Excel Analysis
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <Icon icon="mdi:close" width={24} height={24} />
          </button>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-900 bg-opacity-20'
              : selectedFile
              ? 'border-green-500 bg-green-900 bg-opacity-20'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="text-green-400">
              <Icon icon="mdi:file-excel" className="text-4xl mb-2" />
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-2 text-red-400 hover:text-red-300 text-sm"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="text-gray-400">
              <Icon icon="mdi:cloud-upload" className="text-4xl mb-2" />
              <div className="font-medium mb-2">
                Drop your Excel file here or click to browse
              </div>
              <div className="text-sm mb-4">
                Supports .xlsx, .xls, and .csv files up to 10MB
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Choose File
              </button>
            </div>
          )}
        </div>

        {/* Analysis Information */}
        <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
          <h3 className="font-medium text-blue-400 mb-2">
            <Icon icon="mdi:information" className="inline mr-2" />
            Analysis Process
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Reads the Excel file and identifies the structure</li>
            <li>• Finds the first category and its boundaries</li>
            <li>• Extracts all products with their row indices</li>
            <li>• Provides detailed information about the file structure</li>
          </ul>
        </div>

        {/* Error Display */}
        {importMutation.isError && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
            <div className="text-red-400 text-sm">
              <Icon icon="mdi:alert-circle" className="inline mr-2" />
              Analysis failed: {(importMutation.error as any)?.message || 'Unknown error'}
            </div>
          </div>
        )}

        {/* Success Display */}
        {importMutation.isSuccess && importMutation.data?.success && (
          <div className="mb-6">
            <div className="p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg mb-4">
              <div className="text-green-400 text-sm">
                <Icon icon="mdi:check-circle" className="inline mr-2" />
                Excel file analyzed successfully!
              </div>
            </div>

            {/* Analysis Results */}
            {importMutation.data.data && (
              <div className="space-y-4">
                {/* File Summary */}
                <div className="bg-[#1a2236] p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-3">📊 File Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Rows:</span>
                      <span className="text-white ml-2">{importMutation.data.data.totalRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Products Found:</span>
                      <span className="text-white ml-2">{importMutation.data.data.products.length}</span>
                    </div>
                  </div>
                </div>

                {/* First Category Information */}
                {importMutation.data.data.firstCategory && (
                  <div className="bg-[#1a2236] p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3">📂 First Category</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white ml-2">{importMutation.data.data.firstCategory.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Products:</span>
                        <span className="text-white ml-2">{importMutation.data.data.firstCategory.productCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Start Row:</span>
                        <span className="text-white ml-2">{importMutation.data.data.firstCategory.startIndex}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">End Row:</span>
                        <span className="text-white ml-2">{importMutation.data.data.firstCategory.endIndex}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample Products */}
                {importMutation.data.data.products.length > 0 && (
                  <div className="bg-[#1a2236] p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3">📦 Sample Products (First 10)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-2 text-gray-400">Row</th>
                            <th className="text-left py-2 text-gray-400">Code</th>
                            <th className="text-left py-2 text-gray-400">Name</th>
                            <th className="text-left py-2 text-gray-400">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importMutation.data.data.products.slice(0, 10).map((product, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-2 text-gray-300">{product.rowIndex}</td>
                              <td className="py-2 text-gray-300">{product.code}</td>
                              <td className="py-2 text-white">{product.name}</td>
                              <td className="py-2 text-green-400">{product.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importMutation.data.data.products.length > 10 && (
                        <div className="text-gray-400 text-sm mt-2">
                          ... and {importMutation.data.data.products.length - 10} more products
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {importMutation.data.data.errors.length > 0 && (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-400 mb-2">⚠️ Warnings</h3>
                    <ul className="text-sm text-yellow-300 space-y-1">
                      {importMutation.data.data.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg"
            disabled={importMutation.isPending}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || importMutation.isPending}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            {importMutation.isPending ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin inline mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Icon icon="mdi:magnify" className="inline mr-2" />
                Analyze Excel File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomExcelImportModal;
