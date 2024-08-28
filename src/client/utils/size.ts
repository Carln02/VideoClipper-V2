export function getSize(el: HTMLElement, withMargins: boolean = true): {width: number, height: number} {
    const size = {width: el.offsetWidth, height: el.offsetHeight};
    if (withMargins) {
        const style = getComputedStyle(el);
        size.width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        size.height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    }

    return size;
}