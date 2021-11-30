export default [
  {
    name: 'SEO',
    elements: [
      {
        name: 'Seo title',
        selector: 'seo.title',
      }, {
        name: 'Seo description',
        selector: 'seo.description',
      }, {
        name: 'General Title',
        selector: 'generalData.title',
      }, {
        name: 'General Description',
        selector: 'generalData.description',
      }, {
        name: 'General Keywords',
        selector: 'generalData.keywords',
      }, {
        name: 'Favicon',
        selector: 'generalData.favicon',
      }, {
        name: 'Analytics Dashboard',
        selector: 'analyticsDashboard',
      }, {
        name: 'Pay Per Click Dashboard',
        selector: 'payPerClickDashboard',
      }, {
        name: 'Additional Script',
        selector: 'aditionalScript',
      }, {
        name: 'GTM Script',
        selector: 'gtmId',
      }, {
        name: 'Bing Ownership',
        selector: 'bing_ownership',
      }, {
        name: 'Google Ownership',
        selector: 'google_ownership',
      }],
  },
  {
    name: 'HOME',
    elements: [{
      name: 'Seo title',
      selector: 'seo.title',
    }, {
      name: 'Seo description',
      selector: 'seo.description',
    }, {
      name: 'Initial logo',
      selector: 'logo.src',
    }, {
      name: 'Secondary logo',
      selector: 'secondaryLogo.src',
    }, {
      name: 'Images',
      selector: 'images',
    }, {
      name: 'Carousel title',
      selector: 'carousel.mainTitle',
    }, {
      name: 'Carousel subtitle',
      selector: 'carousel.subTitle',
    }, {
      name: 'Carousel title color',
      selector: 'main-title-color',
    }, {
      name: 'Carousel subtitle color',
      selector: 'main-sub-title-color',
    },
    {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Second ribbon title',
      selector: 'secondRibbon.title',
    }, {
      name: 'Second ribbon subtitle',
      selector: 'secondRibbon.subtitle',
    }, {
      name: 'Quote text',
      selector: 'quote.text',
    }, {
      name: 'Quote author',
      selector: 'quote.author',
    }, {
      name: 'Quote details',
      selector: 'quote.details',
    }, {
      name: 'Second ribbon image',
      selector: 'secondRibbon.image',
    }, {
      name: 'Third ribbon title',
      selector: 'thirdRibbon.title',
    }, {
      name: 'Third ribbon text',
      selector: 'thirdRibbon.text',
    }, {
      name: 'Map marker location',
      selector: 'marker.location',
    }, {
      name: 'Map zoom level',
      selector: 'map.zoom',
    }, {
      name: 'Map styles',
      selector: 'map.styles',
    }, {
      name: 'Map marker icon',
      selector: 'map.marker.icon',
    }, {
      name: 'Map marker url',
      selector: 'map.marker.url',
    }, {
      name: 'Application form title',
      selector: 'applicationForm.title',
    }],
  },
  {
    name: 'AMENITIES',
    elements: [{
      name: 'Seo title',
      selector: 'seo.title',
    }, {
      name: 'Seo description',
      selector: 'seo.description',
    }, {
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'First ribbon title',
      selector: 'subCategories.firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'subCategories.firstRibbon.text',
    }, {
      name: 'Amenities disclaimer text',
      selector: 'disclaimerText.amenities',
    }, {
      name: 'Community disclaimer text',
      selector: 'disclaimerText.community',
    }, {
      name: 'Welcome disclaimer text',
      selector: 'disclaimerText.welcome',
    }, {
      name: 'Amenities items',
      selector: 'amenities.leftList',
    }, {
      name: 'Community image',
      selector: 'community.image',
    }, {
      name: 'Community items',
      selector: 'community.leftList',
    }, {
      name: 'Map image',
      selector: 'map.image',
    }, {
      name: 'Map visibility',
      selector: 'map.isShown',
    }, {
      name: 'Map items',
      selector: 'map.list',
    }],
  },
  {
    name: 'CONTACT',
    elements: [{
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Google business map',
      selector: 'googleBusinessMap',
    }, {
      name: 'Google direction url',
      selector: 'googleDirectionUrl',
    }, {
      name: 'Address name',
      selector: 'address.name',
    }, {
      name: 'Town',
      selector: 'address.town',
    }, {
      name: 'Email',
      selector: 'address.email',
    }, {
      name: 'Week day hours',
      selector: 'hours.mondayToFriday',
    }, {
      name: 'Week day hours',
      selector: 'address.phone',
    }, {
      name: 'Saturday hours',
      selector: 'hours.saturday',
    }, {
      name: 'City',
      selector: 'address.city',
    }, {
      name: 'Sunday hours',
      selector: 'hours.sunday',
    }, {
      name: 'Target phone number',
      selector: 'targetPhoneNumber',
    }],
  },
  {
    name: 'FLOOR_PLANS',
    elements: [{
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Floor plan ID',
      selector: 'propertyIds',
    }],
  },
  {
    name: 'FOOTER',
    elements: [{
      name: 'Facebook link',
      selector: 'links.facebook',
    }, {
      name: 'Youtube link',
      selector: 'links.youtube',
    }, {
      name: 'Instagram link',
      selector: 'links.instagram',
    }, {
      name: 'Twitter link',
      selector: 'links.twitter',
    }, {
      name: 'Resident portal link',
      selector: 'links.residentPortal',
    }, {
      name: 'Property url',
      selector: 'links.propertyUrl',
    }, {
      name: 'Right image',
      selector: 'rightFooter.imageUrl',
    }, {
      name: 'Right image link',
      selector: 'rightFooter.imageClickUrl',
    }],
  },
  {
    name: 'GALLERY',
    elements: [{
      name: 'Seo title',
      selector: 'seo.title',
    }, {
      name: 'Seo description',
      selector: 'seo.description',
    }, {
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Image categories',
      selector: 'imageCategories',
    }, {
      name: 'Pano id',
      selector: 'panoId',
    }, {
      name: 'Images',
      selector: 'images',
    }],
  },
  {
    name: 'NEIGHBORHOOD',
    elements: [{
      name: 'Seo title',
      selector: 'seo.title',
    }, {
      name: 'Seo description',
      selector: 'seo.description',
    }, {
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Property icon',
      selector: 'propertyIcon',
    }, {
      name: 'Locations',
      selector: 'propertyIcon',
    }, {
      name: 'Categories',
      selector: 'propertyIcon',
    }],
  },
  {
    name: 'VIRTUAL_TOUR',
    elements: [{
      name: 'Seo title',
      selector: 'seo.title',
    }, {
      name: 'Seo description',
      selector: 'seo.description',
    }, {
      name: 'Breadcrumbs',
      selector: 'pageTitle',
    }, {
      name: 'First ribbon title',
      selector: 'firstRibbon.title',
    }, {
      name: 'First ribbon text',
      selector: 'firstRibbon.text',
    }, {
      name: 'Virtual tour title',
      selector: 'tours.title',
    }, {
      name: 'Virtual tour link',
      selector: 'tours.link',
    }],
  },
];
