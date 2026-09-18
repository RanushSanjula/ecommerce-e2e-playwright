export function createSignupData() {
    return {
        username: `playwright_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        password: 'jguj78ygu',
    };
}
