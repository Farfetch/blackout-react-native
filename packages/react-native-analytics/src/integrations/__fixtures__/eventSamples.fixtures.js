import {
  fromParameterTypes,
  interactionTypes,
  trackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import eventTypes from '../../eventTypes';
import screenTypes from '../../screenTypes';
import baseAnalyticsEventData from './baseAnalyticsEventData.fixtures';

const baseTrackData = {
  ...baseAnalyticsEventData,
  type: trackTypes.TRACK,
};

const baseScreenData = {
  ...baseAnalyticsEventData,
  type: trackTypes.SCREEN,
};

export const onSetUserEventData = {
  ...baseAnalyticsEventData,
  type: utils.ON_SET_USER_TRACK_TYPE,
  properties: {},
  event: utils.ON_SET_USER_TRACK_TYPE,
};

const eventSamples = {
  [eventTypes.APP_OPENED]: {
    ...baseTrackData,
    event: eventTypes.APP_OPENED,
  },

  [eventTypes.PRODUCT_ADDED_TO_CART]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_ADDED_TO_CART,
    properties: {
      from: fromParameterTypes.WISHLIST,
      cartId: 'skdjsidjsdkdj29j',
      id: '507f1f77bcf86cd799439011',
      sku: 'G-32',
      category: 'Clothing/Tops/T-shirts',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      brand: 'Just A T-Shirt',
      variant: 'Black',
      size: 'L',
      discountValue: 6,
      price: 19,
      priceWithoutDiscount: 25,
      quantity: 1,
      currency: 'USD',
      list: 'my_wishlist',
      listId: 'd3618128-5aa9-4caa-a452-1dd1377a6190',
    },
  },

  [eventTypes.PRODUCT_REMOVED_FROM_CART]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_REMOVED_FROM_CART,
    properties: {
      from: fromParameterTypes.BAG,
      cartId: 'ksjdj92dj29dj92d2j',
      id: '507f1f77bcf86cd799439011',
      sku: 'G-32',
      category: 'Clothing/Tops/T-shirts',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      list: 'Bag',
      listId: 'e0030b3c-b970-4496-bc72-f9a38d6270b1',
      brand: 'Just A T-Shirt',
      variant: 'Black',
      size: 'L',
      price: 19,
      priceWithoutDiscount: 25,
      discountValue: 6,
      quantity: 1,
      currency: 'USD',
      value: 19,
      position: 1,
    },
  },

  [eventTypes.PAYMENT_INFO_ADDED]: {
    ...baseTrackData,
    event: eventTypes.PAYMENT_INFO_ADDED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      paymentType: 'credit card',
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          variant: 'Black',
          currency: 'USD',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [eventTypes.PRODUCT_ADDED_TO_WISHLIST]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_ADDED_TO_WISHLIST,
    properties: {
      from: fromParameterTypes.PLP,
      id: '507f1f77bcf86cd799439011',
      category: 'Clothing/Tops/T-shirts',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      brand: 'Just A T-Shirt',
      variant: 'Black',
      discountValue: 6,
      price: 19,
      priceWithoutDiscount: 25,
      currency: 'USD',
      list: 'Woman shopping',
      listId: '/en-pt/shopping/woman',
      wishlistId: 'd3618128-5aa9-4caa-a452-1dd1377a6190',
    },
  },

  [eventTypes.PRODUCT_REMOVED_FROM_WISHLIST]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_REMOVED_FROM_WISHLIST,
    properties: {
      from: fromParameterTypes.PLP,
      id: '507f1f77bcf86cd799439011',
      list: 'Woman shopping',
      listId: '/en-pt/shopping/woman',
      category: 'Clothing/Tops/T-shirts',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      brand: 'Just A T-Shirt',
      variant: 'Black',
      discountValue: 6,
      price: 19,
      priceWithoutDiscount: 25,
      currency: 'USD',
      wishlistId: 'd3618128-5aa9-4caa-a452-1dd1377a6190',
    },
  },

  [eventTypes.SHIPPING_INFO_ADDED]: {
    ...baseTrackData,
    event: eventTypes.SHIPPING_INFO_ADDED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      shippingTier: 'Next Day',
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          variant: 'Black',
          currency: 'USD',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [eventTypes.CHECKOUT_STARTED]: {
    ...baseTrackData,
    event: eventTypes.CHECKOUT_STARTED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          currency: 'USD',
          variant: 'Black',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [eventTypes.ORDER_COMPLETED]: {
    ...baseTrackData,
    event: eventTypes.ORDER_COMPLETED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          currency: 'USD',
          variant: 'Black',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [eventTypes.ORDER_REFUNDED]: {
    ...baseTrackData,
    event: eventTypes.ORDER_REFUNDED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 19,
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          currency: 'USD',
          variant: 'Black',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [eventTypes.SELECT_CONTENT]: {
    ...baseTrackData,
    event: eventTypes.SELECT_CONTENT,
    properties: {
      contentType: 'biz',
      id: 12312312,
    },
  },

  [eventTypes.PRODUCT_CLICKED]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_CLICKED,
    properties: {
      from: fromParameterTypes.PLP,
      id: '507f1f77bcf86cd799439011',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      position: 3,
      list: 'Woman shopping',
      listId: '/en-pt/shopping/woman',
      currency: 'GBP',
      discountValue: 6,
      price: 19,
      priceWithoutDiscount: 25,
    },
  },

  [eventTypes.PRODUCT_VIEWED]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_VIEWED,
    properties: {
      from: fromParameterTypes.PLP,
      id: '507f1f77bcf86cd799439011',
      sku: 'G-32',
      category: 'Clothing/Tops/T-shirts',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      brand: 'Just A T-Shirt',
      variant: 'Black',
      list: 'Woman shopping',
      listId: '/en-pt/shopping/woman',
      discountValue: 6,
      price: 19,
      priceWithoutDiscount: 25,
      currency: 'USD',
      isOutOfStock: true,
    },
  },

  [eventTypes.PRODUCT_LIST_VIEWED]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_LIST_VIEWED,
    properties: {
      from: fromParameterTypes.PLP,
      category: 'Clothing',
      list: 'Woman shopping',
      currency: 'USD',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          position: 2,
          currency: 'USD',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          list: 'Woman shopping',
          listId: '09a35590-bb62-4027-a630-5da04ec64fb5',
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          position: 3,
          currency: 'USD',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          list: 'Woman shopping',
          listId: '09a35590-bb62-4027-a630-5da04ec64fb5',
        },
      ],
    },
  },

  [eventTypes.LOGIN]: {
    ...baseTrackData,
    event: eventTypes.LOGIN,
    properties: {
      method: 'Acme',
    },
  },

  [eventTypes.SIGNUP_FORM_COMPLETED]: {
    ...baseTrackData,
    event: eventTypes.SIGNUP_FORM_COMPLETED,
    properties: {
      method: 'Acme',
    },
  },

  [eventTypes.FILTERS_APPLIED]: {
    ...baseTrackData,
    event: eventTypes.FILTERS_APPLIED,
    properties: {
      filters: {
        brands: [2765, 4062],
        categories: [135973],
        colors: [1],
        discount: [0],
        gender: [0],
        price: [0, 1950],
        sizes: [16],
      },
    },
  },

  [eventTypes.FILTERS_CLEARED]: {
    ...baseTrackData,
    event: eventTypes.FILTERS_CLEARED,
    properties: {
      filters: {
        brands: [2765, 4062],
        categories: [135973],
        colors: [1],
        discount: [0],
        gender: [0],
        price: [0, 1950],
        sizes: [16],
      },
    },
  },

  [eventTypes.SHARE]: {
    ...baseTrackData,
    event: eventTypes.SHARE,
    properties: {
      method: 'Facebook',
      contentType: 'image',
      id: '123456',
    },
  },

  [eventTypes.CHECKOUT_ABANDONED]: {
    ...baseTrackData,
    event: eventTypes.CHECKOUT_ABANDONED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      currency: 'USD',
    },
  },

  [eventTypes.PLACE_ORDER_STARTED]: {
    ...baseTrackData,
    event: eventTypes.PLACE_ORDER_STARTED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      currency: 'USD',
    },
  },

  [eventTypes.PROMOCODE_APPLIED]: {
    ...baseTrackData,
    event: eventTypes.PROMOCODE_APPLIED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      shippingTier: 'Next Day',
      currency: 'USD',
    },
  },

  [eventTypes.CHECKOUT_STEP_EDITING]: {
    ...baseTrackData,
    event: eventTypes.CHECKOUT_STEP_EDITING,
    properties: {
      step: 1,
    },
  },

  [eventTypes.ADDRESS_INFO_ADDED]: {
    ...baseTrackData,
    event: eventTypes.ADDRESS_INFO_ADDED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      shippingTier: 'Next Day',
      currency: 'USD',
    },
  },

  [eventTypes.SHIPPING_METHOD_ADDED]: {
    ...baseTrackData,
    event: eventTypes.SHIPPING_METHOD_ADDED,
    properties: {
      orderId: '50314b8e9bcf000000000000',
      total: 24.64,
      shipping: 3.6,
      tax: 2.04,
      coupon: 'ACME2019',
      shippingTier: 'Next Day',
      currency: 'USD',
    },
  },

  [eventTypes.INTERACT_CONTENT]: {
    ...baseTrackData,
    event: eventTypes.INTERACT_CONTENT,
    properties: {
      interactionType: interactionTypes.CLICK,
      contentType: 'biz',
      someOtherProperty: 12312312,
    },
  },

  [eventTypes.SIGNUP_NEWSLETTER]: {
    ...baseTrackData,
    event: eventTypes.SIGNUP_NEWSLETTER,
    properties: {
      gender: '0',
    },
  },

  [eventTypes.PRODUCT_UPDATED]: {
    ...baseTrackData,
    event: eventTypes.PRODUCT_UPDATED,
    properties: {
      from: fromParameterTypes.BAG,
      id: '507f1f77bcf86cd799439011',
      name: 'Gareth McConnell Dreamscape T-Shirt',
      colour: 'red',
      oldColour: undefined,
      size: 'L',
      oldSize: undefined,
      quantity: 1,
      oldQuantity: undefined,
    },
  },

  [screenTypes.SEARCH]: {
    ...baseScreenData,
    properties: {
      searchQuery: 'shoes',
      currency: 'EUR',
      products: [{ id: 10000 }, { id: 20000 }],
    },
    event: screenTypes.SEARCH,
  },

  [screenTypes.BAG]: {
    ...baseScreenData,
    event: screenTypes.BAG,
    properties: {
      currency: 'USD',
      from: fromParameterTypes.BAG,
      list: 'Bag',
      listId: 'e0030b3c-b970-4496-bc72-f9a38d6270b1',
      products: [
        {
          id: '507f1f77bcf86cd799439011',
          category: 'Clothing/Tops/T-shirts/',
          name: 'Gareth McConnell Dreamscape T-Shirt',
          brand: 'Just A T-Shirt',
          variant: 'Black',
          size: 'L',
          discountValue: 6,
          price: 19,
          priceWithoutDiscount: 25,
          quantity: 1,
        },
      ],
    },
  },

  [screenTypes.WISHLIST]: {
    ...baseScreenData,
    event: screenTypes.WISHLIST,
    properties: {
      currency: 'USD',
      from: fromParameterTypes.WISHLIST,
      wishlistId: 'd3618128-5aa9-4caa-a452-1dd1377a6190',
    },
  },
};

export default eventSamples;
