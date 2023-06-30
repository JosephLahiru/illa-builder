import { createSlice } from "@reduxjs/toolkit"
import {
  addComponentReducer,
  addModalComponentReducer,
  addPageNodeWithSortOrderReducer,
  addSectionViewReducer,
  addTargetPageSectionReducer,
  batchUpdateComponentLayoutInfoReducer,
  batchUpdateComponentLayoutInfoWhenReflowReducer,
  batchUpdateMultiComponentSlicePropsReducer,
  deleteComponentNodeReducer,
  deleteGlobalStateByKeyReducer,
  deletePageNodeReducer,
  deleteSectionViewReducer,
  deleteTargetPageSectionReducer,
  initComponentReducer,
  resetComponentsReducer,
  setGlobalStateReducer,
  sortComponentNodeChildrenReducer,
  updateComponentContainerReducer,
  updateComponentDisplayNameReducer,
  updateComponentLayoutInfoReducer,
  updateComponentNodeHeightReducer,
  updateComponentPropsReducer,
  updateComponentReflowReducer,
  updateMultiComponentPropsReducer,
  updateRootNodePropsReducer,
  updateSectionViewPropsReducer,
  updateTargetPageLayoutReducer,
  updateTargetPagePropsReducer,
  updateViewportSizeReducer,
} from "@/redux/currentApp/editor/components/componentsReducer"
import { ComponentsInitialState } from "@/redux/currentApp/editor/components/componentsState"

const componentsSlice = createSlice({
  name: "components",
  initialState: ComponentsInitialState,
  reducers: {
    updateComponentNodeHeightReducer,
    addComponentReducer,
    initComponentReducer,
    updateComponentPropsReducer,
    deleteComponentNodeReducer,
    sortComponentNodeChildrenReducer,
    updateComponentDisplayNameReducer,
    updateComponentReflowReducer,
    updateComponentContainerReducer,
    updateMultiComponentPropsReducer,
    updateTargetPageLayoutReducer,
    updateTargetPagePropsReducer,
    deleteTargetPageSectionReducer,
    addTargetPageSectionReducer,
    updateRootNodePropsReducer,
    addPageNodeWithSortOrderReducer,
    deletePageNodeReducer,
    addSectionViewReducer,
    deleteSectionViewReducer,
    updateSectionViewPropsReducer,
    updateViewportSizeReducer,
    addModalComponentReducer,
    resetComponentsReducer,
    updateComponentLayoutInfoReducer,
    batchUpdateComponentLayoutInfoWhenReflowReducer,
    batchUpdateMultiComponentSlicePropsReducer,
    batchUpdateComponentLayoutInfoReducer,
    setGlobalStateReducer,
    deleteGlobalStateByKeyReducer,
  },
})

export const componentsActions = componentsSlice.actions
export default componentsSlice.reducer
