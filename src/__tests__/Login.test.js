import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Login from '../modules/login/Login';
import { Provider } from 'react-redux';
import store from '../data/store';

describe('User signin', () => {
    it('should fail if no credentials are provided', () => {
        const loginComponent = shallow(<Provider store={store}><Login /></Provider>);
        expect(loginComponent.find('Login').length).toBe(1);
    });
});