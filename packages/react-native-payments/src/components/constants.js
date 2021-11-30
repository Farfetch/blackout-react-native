export const OPERATION_SOURCE = 'payment-gateway';
export const OPERATION_TYPE = {
  LOAD: 'load',
  VALIDATION: 'validation',
  ADD_CREDIT_CARD_INSTRUMENT: 'add-creditCard-instrument',
};
export const creditCardinitialState = {
  isFormValid: false,
  instrumentId: '',
  instrumentAdded: false,
};
export const creditCardreducer = (state, action) => {
  return { ...state, ...action };
};
