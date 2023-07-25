import { FC, useCallback, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { v4 } from "uuid"
import { Modal, useMessage } from "@illa-design/react"
import { ILLA_MIXPANEL_EVENT_TYPE } from "@/illa-public-component/MixpanelUtils/interface"
import { MixpanelTrackContext } from "@/illa-public-component/MixpanelUtils/mixpanelContext"
import { ActionResourceCreator } from "@/page/App/components/Actions/ActionGenerator/ActionResourceCreator"
import { ActionResourceSelector } from "@/page/App/components/Actions/ActionGenerator/ActionResourceSelector"
import { AiAgentSelector } from "@/page/App/components/Actions/ActionGenerator/AiAgentSelector"
import { modalContentStyle } from "@/page/Dashboard/components/ResourceGenerator/style"
import { getIsILLAGuideMode } from "@/redux/config/configSelector"
import { configActions } from "@/redux/config/configSlice"
import { actionActions } from "@/redux/currentApp/action/actionSlice"
import {
  ActionContent,
  ActionItem,
  ActionType,
  actionItemInitial,
} from "@/redux/currentApp/action/actionState"
import { getInitialContent } from "@/redux/currentApp/action/getInitialContent"
import { getAllResources } from "@/redux/resource/resourceSelector"
import { fetchCreateAction } from "@/services/action"
import {
  getResourceNameFromResourceType,
  getResourceTypeFromActionType,
} from "@/utils/actionResourceTransformer"
import { DisplayNameGenerator } from "@/utils/generators/generateDisplayName"
import { INIT_ACTION_ADVANCED_CONFIG } from "../AdvancedPanel/constant"
import { ActionTypeSelector } from "./ActionTypeSelector"
import { ActionCreatorPage, ActionGeneratorProps } from "./interface"

export const ActionGenerator: FC<ActionGeneratorProps> = function (props) {
  const { visible, onClose } = props
  const [currentStep, setCurrentStep] = useState<ActionCreatorPage>("select")

  const [currentActionType, setCurrentActionType] = useState<ActionType | null>(
    null,
  )

  const { t } = useTranslation()
  const message = useMessage()
  const dispatch = useDispatch()

  const allResource = useSelector(getAllResources)
  const isGuideMode = useSelector(getIsILLAGuideMode)
  const { track } = useContext(MixpanelTrackContext)

  let title
  switch (currentStep) {
    case "select":
      title = t("editor.action.action_list.action_generator.selector.title")
      break
    case "createAction":
    case "directCreateAction":
      title = t(
        "editor.action.action_list.action_generator.title.choose_resource",
      )
      break
    case "createResource":
      if (currentActionType != null) {
        const resourceType = getResourceTypeFromActionType(currentActionType)
        if (resourceType != null) {
          title = t("editor.action.form.title.configure", {
            name: getResourceNameFromResourceType(resourceType),
          })
        }
      }
      break
  }

  const transformResource = currentActionType
    ? getResourceTypeFromActionType(currentActionType)
    : null

  useEffect(() => {
    if (currentStep === "createAction") {
      if (currentActionType === "agent") {
        return
      } else if (
        allResource.filter((value) => {
          return value.resourceType === currentActionType
        }).length === 0
      ) {
        setCurrentStep("createResource")
      }
    }
  }, [currentStep, currentActionType, allResource])

  const handleDirectCreateAction = useCallback(
    async (
      resourceId: string,
      successCallback?: () => void,
      loadingCallback?: (loading: boolean) => void,
    ) => {
      if (currentActionType === null) {
        return
      }
      const displayName =
        DisplayNameGenerator.generateDisplayName(currentActionType)
      const initialContent = getInitialContent(currentActionType)
      const data: Omit<ActionItem<ActionContent>, "actionId"> = {
        actionType: currentActionType,
        displayName,
        resourceId,
        content: initialContent,
        ...actionItemInitial,
      }
      if (data.actionType !== "transformer") {
        data.config = {
          public: false,
          advancedConfig: INIT_ACTION_ADVANCED_CONFIG,
        }
      }
      if (isGuideMode) {
        const createActionData: ActionItem<ActionContent> = {
          ...data,
          actionId: v4(),
        }
        dispatch(actionActions.addActionItemReducer(createActionData))
        dispatch(configActions.changeSelectedAction(createActionData))
        successCallback?.()
        return
      }
      loadingCallback?.(true)
      try {
        const { data: responseData } = await fetchCreateAction(data)
        message.success({
          content: t("editor.action.action_list.message.success_created"),
        })
        dispatch(actionActions.addActionItemReducer(responseData))
        dispatch(configActions.changeSelectedAction(responseData))
        successCallback?.()
      } catch (_e) {
        message.error({
          content: t("editor.action.action_list.message.failed"),
        })
        DisplayNameGenerator.removeDisplayName(displayName)
      }
      loadingCallback?.(false)
    },
    [currentActionType, dispatch, message, t, isGuideMode],
  )

  const handleBack = useCallback(
    (page: ActionCreatorPage) => {
      track?.(
        ILLA_MIXPANEL_EVENT_TYPE.CLICK,
        {
          element: "resource_configure_back",
          parameter5: transformResource,
        },
        "both",
      )
      setCurrentStep(page)
    },
    [track, transformResource],
  )

  const handleCancelModal = useCallback(() => {
    const element =
      currentStep === "createResource"
        ? "resource_configure_close"
        : "resource_type_modal"
    track?.(
      ILLA_MIXPANEL_EVENT_TYPE.CLICK,
      {
        element,
        parameter5: transformResource,
      },
      "both",
    )
    onClose()
    setCurrentStep("select")
    setCurrentActionType(null)
  }, [currentStep, onClose, track, transformResource])

  const handleActionTypeSelect = useCallback(
    (actionType: ActionType) => {
      track?.(ILLA_MIXPANEL_EVENT_TYPE.CLICK, {
        element: "resource_type_modal_resource",
        parameter5: actionType,
      })
      if (actionType == "transformer") {
        onClose()
      } else {
        setCurrentStep("createAction")
        setCurrentActionType(actionType)
      }
    },
    [onClose, track],
  )

  const handleCreateResource = useCallback((actionType: ActionType) => {
    setCurrentActionType(actionType)
    setCurrentStep("createResource")
  }, [])

  const handleCreateAction = useCallback(() => {
    setCurrentStep("select")
    onClose()
  }, [onClose])

  const handleFinishCreateNewResource = useCallback(
    (resourceId: string) => {
      track?.(
        ILLA_MIXPANEL_EVENT_TYPE.CLICK,
        {
          element: "resource_configure_save",
          parameter5: transformResource,
        },
        "both",
      )
      handleDirectCreateAction(resourceId, () => {
        setCurrentStep("select")
        onClose()
      })
    },
    [handleDirectCreateAction, onClose, track, transformResource],
  )
  useEffect(() => {
    if (currentStep === "createResource" && transformResource && visible) {
      track?.(
        ILLA_MIXPANEL_EVENT_TYPE.SHOW,
        {
          element: "resource_configure_modal",
          parameter5: transformResource,
        },
        "both",
      )
    }
  }, [currentStep, track, transformResource, visible])

  useEffect(() => {
    if (currentStep === "select" && visible) {
      track?.(
        ILLA_MIXPANEL_EVENT_TYPE.SHOW,
        {
          element: "resource_type_modal",
          parameter5: transformResource,
        },
        "both",
      )
    }
  }, [currentStep, track, currentActionType, visible, transformResource])

  const isMaskClosable = currentStep !== "createResource"

  return (
    <Modal
      w="1080px"
      visible={visible}
      footer={false}
      closable
      maskClosable={isMaskClosable}
      withoutLine
      withoutPadding
      title={title}
      onCancel={handleCancelModal}
    >
      <div css={modalContentStyle}>
        {currentStep === "select" && (
          <ActionTypeSelector onSelect={handleActionTypeSelect} />
        )}
        {currentStep === "createAction" &&
          currentActionType &&
          (currentActionType === "agent" ? (
            <AiAgentSelector
              actionType={currentActionType}
              onBack={handleBack}
              handleCreateAction={handleDirectCreateAction}
              onCreateAction={handleCreateAction}
            />
          ) : (
            <ActionResourceSelector
              actionType={currentActionType}
              onBack={handleBack}
              handleCreateAction={handleDirectCreateAction}
              onCreateResource={handleCreateResource}
              onCreateAction={handleCreateAction}
            />
          ))}
        {currentStep === "createResource" && transformResource && (
          <ActionResourceCreator
            resourceType={transformResource}
            onBack={handleBack}
            onFinished={handleFinishCreateNewResource}
          />
        )}
      </div>
    </Modal>
  )
}

ActionGenerator.displayName = "ActionGenerator"
