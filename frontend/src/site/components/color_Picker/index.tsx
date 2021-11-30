import React, { useState, FC } from 'react';
import { SketchPicker } from 'react-color';
import { Popover } from 'reactstrap';
import { FormItem } from 'site/components';

interface ColorPickerProps {
  id: string,
  value: string,
  target: string,
  onChange: (data: { target: { id: string, value: string | number } }) => void,
  defaultColors?: string[],
  className?: string,
  isShowTooltip?: boolean,
  title?: string,
}

const ColorPicker: FC<ColorPickerProps> = ({ id, value, target, onChange, defaultColors = [], className = '', isShowTooltip = true, title = 'Color' }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggle = () => setPopoverOpen(!popoverOpen);

  const modifiers = {
    preventOverflow: {
      enabled: false,
    },
    flip: {
      enabled: false,
    },
  };
  return (
    <div className={className}>
      <FormItem
        value={value}
        title={title}
        id={target}
        name="color"
        section="HOME"
        showTooltip={isShowTooltip}
      />
      <Popover
        placement="top"
        trigger="legacy"
        modifiers={modifiers}
        isOpen={popoverOpen}
        target={target}
        toggle={toggle}
      >
        <SketchPicker
          presetColors={[...new Set(defaultColors)]}
          color={value}
          onChangeComplete={(c) => {
            onChange({ target: { id, value: c.hex } });
          }}
        />
      </Popover>
    </div>
  );
};

export default ColorPicker;
