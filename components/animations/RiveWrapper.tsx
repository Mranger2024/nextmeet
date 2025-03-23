'use client'

import { useRive, Fit, Alignment, Layout } from '@rive-app/react-canvas'

interface RiveWrapperProps {
  animationSrc: string
  stateMachine?: string
  artboard?: string
  className?: string
  fit?: Fit
}

const RiveWrapper: React.FC<RiveWrapperProps> = ({
  animationSrc,
  stateMachine = '',
  artboard = 'default',
  className = '',
  fit = Fit.Contain
}) => {
  const { rive, RiveComponent } = useRive({
    src: animationSrc,
    stateMachines: stateMachine ? [stateMachine] : undefined,
    artboard,
    autoplay: true
  })

  if (rive) {
    rive.layout = new Layout({
      fit: fit,
      alignment: Alignment.Center
    })
  }

  if (!rive) {
    return null
  }

  return (
    <div className={className}>
      <RiveComponent />
    </div>
  )
}

export default RiveWrapper