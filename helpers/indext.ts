export const getViewableAddress = (address: string) => {
    if (typeof address !== 'string') {
        return '';
    }

    return address.substring(0, 5) + '...' + address.substring(address.length - 5);
}