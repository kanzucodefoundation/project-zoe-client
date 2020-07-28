import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import store from './data/store';
/*
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
*/
it("renders without crashing", () => {
  shallow(<Provider store={store}><App /></Provider>);
});