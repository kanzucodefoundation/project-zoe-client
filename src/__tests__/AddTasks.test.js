import renderer from 'react-test-renderer';
import React from 'react';
import AddTasks from '../modules/tasks/AddTasks';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../data/store';

it("renders without crashing", () => {
    shallow(<Provider store={store}><AddTasks /></Provider>);
});
