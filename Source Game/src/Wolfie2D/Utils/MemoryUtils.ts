import Stack from "../DataTypes/Stack";

export default class MemoryUtils {
    /**
     * Returns an approximate size in bytes of any object
     * @param obj The object to get the size of
     * @returns An approximation of the number of bytes in the object provided
     */
    static approxSizeOf(obj: any): number {
        let objectList = new Array<object>();
        let stack = new Stack<any>(10000);
        stack.push(obj);
        let bytes = 0;

        while(!stack.isEmpty()){
            let item = stack.pop();

            // We aren't interested in counting window and document
            if(item === window || item === document) continue;

            if((typeof item) === "boolean"){
                bytes += 4;
            } else if((typeof item) === "number"){
                bytes += 8;
            } else if((typeof item) === "string"){
                bytes += item.length;
            } else if((typeof item) === "object" && objectList.indexOf(item) === -1){
                // We haven't seen this object before - log it
                objectList.push(item);

                // Get the number of bytes in all of its fields
                for(let field in item){
                    try {
                        stack.push(item[field]);
                    } catch(e){
                        console.log("Pushing item: ", + item[field]);
                        console.warn(`Ran out of room counting memory (Stack has size ${stack.size()}) - returning current number of bytes`);
                        return bytes;
                    }
                }
            }
        }

        return bytes;
    }
}