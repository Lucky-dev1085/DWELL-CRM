import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import middleware from 'store/middleware';
import dwellReducers from 'dwell/reducers';
import siteReducers from 'site/reducers';
import competeReducers from 'compete/reducers';
import demoReducers from 'main_page/reducers';

const reducers = combineReducers({ ...dwellReducers, ...siteReducers, ...competeReducers, ...demoReducers });
const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk, middleware())));
export default store;
