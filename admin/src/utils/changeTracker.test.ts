import { getOnlyChangedFields } from './changeTracker';

// Simple test to verify change tracking works
const testChangeTracking = () => {
  const original = {
    name: 'Original Shop',
    contactInfo: { phoneNumber: '1234567890', email: 'test@example.com' },
    address: { city: 'New York', street: '123 Main St', district: 'Manhattan', coordinates: { lat: 40.7128, lng: -74.0060 } },
    status: 'active'
  };

  const modified = {
    name: 'Modified Shop', // Changed
    contactInfo: { phoneNumber: '1234567890', email: 'test@example.com' }, // Same
    address: { city: 'Los Angeles', street: '123 Main St', district: 'Manhattan', coordinates: { lat: 40.7128, lng: -74.0060 } }, // Partially changed
    status: 'active' // Same
  };

  const changes = getOnlyChangedFields(original, modified);
  
  console.log('Original:', original);
  console.log('Modified:', modified);
  console.log('Changes detected:', changes);
  
  // Expected changes: name and address.city should be different, but address should include all required fields
  const expectedChanges = {
    name: 'Modified Shop',
    address: { city: 'Los Angeles', street: '123 Main St', district: 'Manhattan', coordinates: { lat: 40.7128, lng: -74.0060 } }
  };
  
  console.log('Expected changes:', expectedChanges);
  console.log('Test passed:', JSON.stringify(changes) === JSON.stringify(expectedChanges));
};

// Run the test
testChangeTracking();
