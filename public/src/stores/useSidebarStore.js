import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  sidebarShow: true,
  sidebarUnfoldable: false,

  toggleSidebar: (visible) => set({ sidebarShow: visible }),
  toggleUnfoldable: () => set((state) => ({ sidebarUnfoldable: !state.sidebarUnfoldable })),
}));
