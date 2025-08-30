import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { importProductsFromExcel, getImportStatus } from '../../../services/excelImportService';
import { Icon } from '@iconify/react';

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLimit, setImportLimit] = useState<number>(500);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get import service status
  const { data: statusData } = useQuery({
    queryKey: ['excelImportStatus'],
    queryFn: getImportStatus,
    enabled: open,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({ file, limit }: { file: File; limit: number }) => {
      return importProductsFromExcel(file, limit);
    },
    onSuccess: (data) => {
      if (data.success) {
        onSuccess?.();
        onClose();
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
      alert('Please select a file to import');
      return;
    }

    importMutation.mutate({
      file: selectedFile,
      limit: importLimit
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportLimit(500);
    setDragActive(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#232b42] rounded-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            📊 {t('products.importFromExcel')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <Icon icon="mdi:close" width={24} height={24} />
          </button>
        </div>

        {/* Service Status */}
        {statusData?.success && (
          <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
            <div className="text-green-400 text-sm">
              <Icon icon="mdi:check-circle" className="inline mr-2" />
              {statusData.data?.message}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Supported formats: {statusData.data?.supportedFormats.join(', ')} | 
              Max size: {statusData.data?.maxFileSize} | 
              Default limit: {statusData.data?.defaultLimit}
            </div>
          </div>
        )}

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

        {/* Import Settings */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Import Limit
          </label>
          <div className="flex items-center gap-4">
            <select
              value={importLimit}
              onChange={(e) => setImportLimit(Number(e.target.value))}
              className="bg-[#1a2236] text-white px-3 py-2 rounded-lg border border-gray-600"
            >
              <option value={500}>First 500 products</option>
              <option value={1000}>First 1000 products</option>
              <option value={2000}>First 2000 products</option>
              <option value={-1}>All products</option>
            </select>
            <span className="text-gray-400 text-sm">
              {importLimit === -1 ? 'Will process all products in the file' : `Will process first ${importLimit} products`}
            </span>
          </div>
        </div>

        {/* Import Information */}
        <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
          <h3 className="font-medium text-blue-400 mb-2">
            <Icon icon="mdi:information" className="inline mr-2" />
            Import Process Information
          </h3>
                     <ul className="text-sm text-gray-300 space-y-1">
             <li>• Products will be automatically categorized based on Excel structure</li>
             <li>• Product names will be translated from Russian to Uzbek using AI</li>
             <li>• Product descriptions will be generated in both languages</li>
             <li>• Product images will be searched from Uzbek e-commerce sites</li>
             <li>• Appropriate units will be assigned automatically</li>
             <li>• Duplicate products will be skipped</li>
           </ul>
        </div>

        {/* Error Display */}
        {importMutation.isError && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
            <div className="text-red-400 text-sm">
              <Icon icon="mdi:alert-circle" className="inline mr-2" />
              Import failed: {(importMutation.error as any)?.message || 'Unknown error'}
            </div>
          </div>
        )}

        {/* Success Display */}
        {importMutation.isSuccess && importMutation.data?.success && (
          <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
            <div className="text-green-400 text-sm">
              <Icon icon="mdi:check-circle" className="inline mr-2" />
              {importMutation.data.data?.message}
            </div>
            {importMutation.data.data?.errors && importMutation.data.data.errors.length > 0 && (
              <div className="mt-2 text-yellow-400 text-xs">
                <div className="font-medium">Errors occurred:</div>
                <ul className="list-disc list-inside mt-1">
                  {importMutation.data.data.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importMutation.data.data.errors.length > 5 && (
                    <li>... and {importMutation.data.data.errors.length - 5} more errors</li>
                  )}
                </ul>
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
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || importMutation.isPending}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            {importMutation.isPending ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin inline mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Icon icon="mdi:upload" className="inline mr-2" />
                Import Products
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
