import React, { FC } from 'react';
import { get, map } from 'lodash';
import { CustomSelect } from 'site/components/common';
import { FontOption } from 'src/interfaces';

interface SelectProps {
  options: FontOption[],
  optionName: string,
  pageData: { siteTemplate?: string },
  onChange: (data: { target: { id: string, value: string | number } }) => void,
}

const FontSelect: FC<SelectProps> = ({ options, optionName, pageData, onChange }) => {
  const mappedOptions = map(options, (option, key) => {
    let mapValue = null;

    switch (optionName) {
      case 'customFonts.headingFont':
        if (option.isCustom || option.files.regular) mapValue = (<option value={option.family} key={key}>{option.family}</option>);
        break;
      case 'customFonts.bodyFont':
        if (
          option.isCustom || (option.files[300]
            && option.files.regular
            && option.files.italic
            && option.files[600]
            && option.files[700])
        ) {
          mapValue = (<option value={option.family} key={key}>{option.family}</option>);
        }
        break;
      case 'customFonts.quoteFont':
        if (option.isCustom || option.files.italic) mapValue = (<option value={option.family} key={key}>{option.family}</option>);
        break;
      case 'customFonts.modalSubtitle':
        if (option.isCustom || option.files[300]) mapValue = (<option value={option.family} key={key}>{option.family}</option>);
        break;
      default:
        break;
    }
    return mapValue;
  });

  return (
    <CustomSelect value={get(pageData, `${optionName}`)} defaultValue="default" id={optionName} onChange={onChange}>
      <option label="-- select an option -- " value="default" />
      {mappedOptions}
    </CustomSelect>
  );
};

export default FontSelect;
