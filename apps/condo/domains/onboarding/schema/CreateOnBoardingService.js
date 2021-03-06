/**
 * Generated by `createservice onboarding.CreateOnBoardingService`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/onboarding/access/CreateOnBoardingService')
const { OnBoarding } = require('@condo/domains/onboarding/utils/serverSchema')
const { OnBoardingStep } = require('@condo/domains/onboarding/utils/serverSchema')
const { ONBOARDING_TYPES, ONBOARDING_STEPS } = require('@condo/domains/onboarding/constants')

const CreateOnBoardingService = new GQLCustomSchema('CreateOnBoardingService', {
    types: [
        {
            access: true,
            type: `enum OnBoardingType { ${ONBOARDING_TYPES.join(' ')} }`,
        },
        {
            access: true,
            type: 'input CreateOnBoardingInput { dv: Int!, sender: JSON!, type: OnBoardingType, userId:ID! }',
        },
    ],
    mutations: [
        {
            access: access.canCreateOnBoarding,
            schema: 'createOnBoardingByType(data: CreateOnBoardingInput!): OnBoarding',
            resolver: async (parent, args, context) => {
                const { data } = args
                const { type, dv, sender, userId } = data

                if (!ONBOARDING_TYPES.includes(type)) {
                    throw new Error(`[error] Cannot create onBoarding for ${type}. Unsupported role.`)
                }

                const onBoardingStepData = ONBOARDING_STEPS[type]

                if (!onBoardingStepData) {
                    throw new Error(`[error] Cannot create onBoarding for ${type}. StepTransitions is not defined.`)
                }

                const onBoarding = await OnBoarding.create(context, {
                    dv,
                    type,
                    sender,
                    stepsTransitions: onBoardingStepData.transitions,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                })

                for (let i = 0; i < onBoardingStepData.steps.length; i++) {
                    const currentStep = onBoardingStepData.steps[i]
                    const key = `${currentStep.action}.${currentStep.entity}`

                    await OnBoardingStep.create(context, {
                        dv,
                        sender,
                        title: `onboarding.step.title.${key}`,
                        description: `onboarding.step.description.${key}`,
                        ...currentStep,
                        onBoarding: { connect: { id: onBoarding.id } },
                    })
                }

                return onBoarding
            },
        },
    ],
})

module.exports = {
    CreateOnBoardingService,
}
