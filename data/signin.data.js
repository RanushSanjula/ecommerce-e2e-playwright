export function createSigninData() {
    return {
        username: 'RSK',
        password: 'Test@12345',
    };
}

export function EmptyData() {
    return {
        username: '',
        password: '',
    };
}

export function InvalidPwd() {
    return {
        username: 'RSK',
        password: 'Test@234',
    };
}

export function InvalidUsername() {
    return {
        username: 'RSK1',
        password: 'Test@12345',
    };
}
