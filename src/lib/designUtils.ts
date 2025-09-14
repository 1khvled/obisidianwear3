export function getDesignPreference(): 'old' | 'new' {
  if (typeof window === 'undefined') return 'new'; // Default to new design on server
  
  const savedPreference = localStorage.getItem('mto_design_preference');
  return savedPreference === 'old' ? 'old' : 'new'; // Default to new design
}

export function setDesignPreference(design: 'old' | 'new'): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('mto_design_preference', design);
}
