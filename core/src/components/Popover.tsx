import './Popover.scss'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Placement } from '@popperjs/core'
import { createPopper } from '@popperjs/core'

export interface PopoverProps {
  children: React.ReactNode
  content: React.ReactNode

  trigger?: 'click' | 'hover' | 'always'
  placement?: Placement
  offset?: [number, number]

  className?: string
  contentClassName?: string
  style?: React.CSSProperties
  contentStyle?: React.CSSProperties

  onClick?: () => void
}

const prefix = 'ppd-popover'

export function Popover(props: PopoverProps) {
  const {
    children,
    content,
    placement = 'top',
    trigger = 'hover',
    offset = [0, 0],
    onClick
  } = props
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
  const popper = useRef<ReturnType<typeof createPopper>>()

  useEffect(() => {
    if (referenceElement && popperElement) {
      popper.current = createPopper(referenceElement, popperElement, { placement })
      return () => popper.current?.destroy()
    }
  }, [referenceElement, popperElement, placement, offset])
  useEffect(() => {
    if (popper.current) {
      popper.current.setOptions({
        placement,
        modifiers: [
          { name: 'offset', options: { offset } }
        ]
      })
    }
  }, [offset, placement])

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (trigger === 'always') {
      setVisible(true)
    }
  }, [trigger])
  useEffect(() => {
    if (visible) {
      popper.current?.update()
    }
  }, [visible])
  return <>
    <div
      ref={setReferenceElement}
      className={
      `${prefix}-reference ${prefix}-${trigger}`
        + (props.className ? ' ' + props.className : '')
      }
      style={props.style}
      onClick={() => {
        if (trigger === 'click') {
          setVisible(!visible)
        }
        onClick?.()
      }}
      onMouseOver={() => {
        if (trigger === 'hover') {
          setVisible(true)
        }
      }}
      onMouseOut={() => {
        if (trigger === 'hover') {
          setVisible(false)
        }
      }}
      >
      {children}
    </div>
    {createPortal(<div
      ref={setPopperElement}
      className={
        `monaco-editor ${prefix}`
        + (props.contentClassName ? ' ' + props.contentClassName : '')
      }
      data-show={visible}
      onMouseOver={() => {
        if (trigger === 'hover') {
          setVisible(true)
        }
      }}
      onMouseOut={() => {
        if (trigger === 'hover') {
          setVisible(false)
        }
      }}
      >
      {content}
      <div className='ppd-popover-arrow' data-position={placement} />
    </div>, document.body)}
  </>
}