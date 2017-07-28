export class ApdsUtil {
    public static DeepClone(source: any) {
        if (source === null || typeof source !== 'object') {
            return source;
        } else {
            if (source instanceof Array) {
                const target = [];
                source.forEach(item => target.push(ApdsUtil.DeepClone(item)));
                return target;
            } else {
                const target = {};
                for (const key in source) {
                    target[key] = ApdsUtil.DeepClone(source[key]);
                }
                return target;
            }
        }
    }
}
