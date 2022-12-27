import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('Test - navigation to login page', () => {
    render( <Login setToken={() => { }} /> );

    // verify navigation to login route
    const username = screen.getByLabelText('Enter your email');
    //console.log('username: ', username.tagName);
    expect(username).toBeDefined();
    const password = screen.getByLabelText('Enter your password');
    //console.log('password: ', password.tagName);
    expect(password).toBeDefined();
    const loginButton = screen.getByRole('button', { name: /Login/i });
    //console.log('loginButton: ', loginButton.tagName);
    expect(loginButton).toBeDefined();
})

describe('Test - input error case', () => {
    it('input error username', () => {
        render( <Login setToken={() => { }} /> );
        const username = screen.getByLabelText('Enter your email');
        const password = screen.getByLabelText('Enter your password');
        const loginButton = screen.getByRole('button', { name: /Login/i });
        fireEvent.change(username, {target: {value: 'demouser'}});
        fireEvent.change(password, {target: {value: 'test'}});
        fireEvent.click(loginButton);
        const alertItem = screen.getByRole('alert');
        expect(alertItem).toHaveTextContent('Email is invalid');
    })
    it('input password length < 8', () => {
        render( <Login setToken={() => { }} /> );
        const username = screen.getByLabelText('Enter your email');
        const password = screen.getByLabelText('Enter your password');
        const loginButton = screen.getByRole('button', { name: /Login/i });
        fireEvent.change(username, {target: {value: 'demouser@test.com'}});
        fireEvent.change(password, {target: {value: 'test'}});
        fireEvent.click(loginButton);
        const alertItem = screen.getByRole('alert');
        expect(alertItem).toHaveTextContent('Password: minimum character length is 8');
    })
})
