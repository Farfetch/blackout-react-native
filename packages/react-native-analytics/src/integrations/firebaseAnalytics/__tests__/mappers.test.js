import { eventsMapper } from '../mapper';
import { eventTypes } from '@farfetch/blackout-core/analytics';

const mockData = {
  properties: {
    method: 'method',
    item_list_id: 'item_list_id',
    item_list_name: 'item_list_name',
    currency: 'currency',
    value: 'value',
    coupon: 'coupon',
    items: 'items',
    checkout_option: 'checkout_option',
    checkout_step: 'checkout_step',
    creative_name: 'creative_name',
    creative_slot: 'creative_slot',
    location_id: 'location_id',
    promotion_id: 'promotion_id',
    promotion_name: 'promotion_name',
  },
};

describe('eventsMapper', () => {
  Object.keys(eventsMapper).forEach(event => {
    it(`Should match the snapshot for the event: ${event}`, () => {
      expect(eventsMapper[event](mockData)).toMatchSnapshot();
    });
  });

  describe('Should return the right method depending on the payload passed', () => {
    it(`for event: ${eventTypes.CHECKOUT_STEP_COMPLETED} with step "1"`, () => {
      const data = {
        properties: {
          step: 1,
        },
      };

      const firebaseAnalyticsMethod = eventsMapper[
        eventTypes.CHECKOUT_STEP_COMPLETED
      ](data);

      expect(firebaseAnalyticsMethod).toMatchSnapshot();
    });
    it(`for event: ${eventTypes.CHECKOUT_STEP_COMPLETED} with step "2"`, () => {
      const data = {
        properties: {
          step: 2,
        },
      };

      const firebaseAnalyticsMethod = eventsMapper[
        eventTypes.CHECKOUT_STEP_COMPLETED
      ](data);

      expect(firebaseAnalyticsMethod).toMatchSnapshot();
    });
  });

  it(`for event: ${eventTypes.CHECKOUT_STEP_COMPLETED} with step "3"`, () => {
    const data = {
      properties: {
        step: 3,
      },
    };

    const firebaseAnalyticsMethod = eventsMapper[
      eventTypes.CHECKOUT_STEP_COMPLETED
    ](data);

    expect(firebaseAnalyticsMethod).toMatchSnapshot();
  });
});
