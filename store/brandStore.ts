import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ParentBrand {
  id: string
  name: string
  domain?: string
}

interface BrandStore {
  currentBrandId: string | null
  parentBrands: ParentBrand[]
  isLoading: boolean
  setCurrentBrandId: (brandId: string) => void
  setParentBrands: (brands: ParentBrand[]) => void
  setLoading: (loading: boolean) => void
  getCurrentBrand: () => ParentBrand | null
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      currentBrandId: null,
      parentBrands: [],
      isLoading: false,
      setCurrentBrandId: (brandId: string) => set({ currentBrandId: brandId }),
      setParentBrands: (brands: ParentBrand[]) => set({ parentBrands: brands }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      getCurrentBrand: () => {
        const { currentBrandId, parentBrands } = get()
        return parentBrands.find(brand => brand.id === currentBrandId) || null
      },
    }),
    {
      name: 'brand-store',
      partialize: (state) => ({
        currentBrandId: state.currentBrandId,
        parentBrands: state.parentBrands
      }),
    }
  )
)
