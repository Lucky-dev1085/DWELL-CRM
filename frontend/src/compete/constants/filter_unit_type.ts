import { sortBy } from 'lodash';
import { filterUnitTypeMap } from 'compete/constants';
import { UnitType } from 'src/interfaces';

interface UnitData {
  unit_types?: UnitType[],
}

export default (data: UnitData, isProperty = false): UnitType[] => {
  let filterUnitType = sortBy(data.unit_types.filter(el => el.units_count), el => filterUnitTypeMap[isProperty ? el.name : el.unit_type]);
  filterUnitType = filterUnitType.map((el, index) => {
    const averageSize = isProperty ? el.average_size : el.avg_size;
    const averageRent = isProperty ? el.average_rent : el.avg_rent;
    const averageRentSqft = averageSize ? averageRent / averageSize : 0;

    return ({
      ...el,
      avg_rent_sqft: averageRentSqft,
      unit_type_index: index,
      id: el.id || (index + 1),
    });
  });

  return filterUnitType;
};
