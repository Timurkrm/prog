import { orderBurgerApi } from '../../../utils/burger-api';
import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  nanoid
} from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

export type TConsturctorState = {
  loading: boolean;
  constructorItems: {
    bun: TConstructorIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

export type TConstructorState = TConsturctorState;

export const initialState: TConsturctorState = {
  loading: false,
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const orderBurger = createAsyncThunk(
  'user/order',
  async (data: string[]) => orderBurgerApi(data)
);

export const constructorSlice = createSlice({
  name: 'constructorBurger',
  initialState,
  selectors: {
    getConstructorState: (state) => state
  },
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.constructorItems.bun = action.payload;
        } else {
          state.constructorItems.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => {
        const id = nanoid();
        return { payload: { ...ingredient, id } };
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (i) => i.id !== action.payload
        );
    },
    moveIngredientUp: (state, action: PayloadAction<number>) => {
      const from = action.payload;
      const items = state.constructorItems.ingredients;
      if (from <= 0 || from >= items.length) return;
      const to = from - 1;
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
    },
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      const from = action.payload;
      const items = state.constructorItems.ingredients;
      if (from < 0 || from >= items.length - 1) return;
      const to = from + 1;
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
    },
    setRequest: (state, action: PayloadAction<boolean>) => {
      state.orderRequest = action.payload;
    },
    resetModal: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.loading = true;
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.loading = false;
        state.orderRequest = false;
        state.error = action.error.message ?? 'Order request failed';
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.loading = false;
        state.orderRequest = false;
        state.error = null;
        state.orderModalData = action.payload.order as TOrder;
        state.constructorItems = {
          bun: null,
          ingredients: []
        };
      });
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  setRequest,
  resetModal
} = constructorSlice.actions;

export const { getConstructorState } = constructorSlice.selectors;
export default constructorSlice.reducer;
