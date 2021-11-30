from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.factories import UnitFactory, FloorPlanFactory


class RealPageTaskBaseTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(RealPageTaskBaseTests, self).setUp()
        self.property.real_page_pmc_id = 'real_page_pmc_id'
        self.property.real_page_site_id = 'real_page_site_id'
        self.property.save()

        plan = FloorPlanFactory(property=self.property)

        UnitFactory(property=self.property, unit='7051', floor_plan=plan)
        UnitFactory(property=self.property, unit='8009', floor_plan=plan)
