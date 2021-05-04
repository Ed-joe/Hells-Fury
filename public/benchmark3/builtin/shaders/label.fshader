precision mediump float;

uniform vec4 u_BackgroundColor;
uniform vec4 u_BorderColor;
uniform float u_BorderWidth;
uniform float u_BorderRadius;
uniform vec2 u_MaxSize;

varying vec4 v_Position;

void main(){
    vec2 adj_MaxSize = u_MaxSize - u_BorderWidth;
    vec2 rad_MaxSize = u_MaxSize - u_BorderRadius;
    vec2 rad2_MaxSize = u_MaxSize - 2.0*u_BorderRadius;

    bool inX = (v_Position.x < adj_MaxSize.x) && (v_Position.x > -adj_MaxSize.x);
    bool inY = (v_Position.y < adj_MaxSize.y) && (v_Position.y > -adj_MaxSize.y);

    bool inRadiusRangeX = (v_Position.x < rad_MaxSize.x) && (v_Position.x > -rad_MaxSize.x);
    bool inRadiusRangeY = (v_Position.y < rad_MaxSize.y) && (v_Position.y > -rad_MaxSize.y);

    bool inRadius2RangeX = (v_Position.x < rad2_MaxSize.x) && (v_Position.x > -rad2_MaxSize.x);
    bool inRadius2RangeY = (v_Position.y < rad2_MaxSize.y) && (v_Position.y > -rad2_MaxSize.y);

    if(inX && inY){
        // Inside bounds, draw background color
        gl_FragColor = u_BackgroundColor;
    } else {
        // In boundary, draw border color
        gl_FragColor = u_BorderColor;
    }

    // This isn't working well right now
    /*
    if(inRadius2RangeX || inRadius2RangeY){
        // Draw normally
        if(inX && inY){
            // Inside bounds, draw background color
            gl_FragColor = u_BackgroundColor;
        } else {
            // In boundary, draw border color
            gl_FragColor = u_BorderColor;
        }
    } else if(inRadiusRangeX || inRadiusRangeY){
        // Draw a rounded boundary for the inner part
        float x = v_Position.x - sign(v_Position.x)*rad2_MaxSize.x;
        float y = v_Position.y - sign(v_Position.y)*rad2_MaxSize.y;

        float radSq = x*x + y*y;
        float bRadSq = u_BorderRadius*u_BorderRadius;

        if(radSq > bRadSq){
            // Outside of radius - draw as transparent
            gl_FragColor = u_BorderColor;
        } else {
            gl_FragColor = u_BackgroundColor;
        }
    } else {
        // Both coordinates are in the circular section
        float x = v_Position.x - sign(v_Position.x)*rad_MaxSize.x;
        float y = v_Position.y - sign(v_Position.y)*rad_MaxSize.y;

        float radSq = x*x + y*y;
        float bRadSq = u_BorderRadius*u_BorderRadius;

        if(radSq > bRadSq){
            // Outside of radius - draw as transparent
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else if(sqrt(bRadSq) - sqrt(radSq) < u_BorderWidth) {
            // In border
            gl_FragColor = u_BorderColor;
        } else {
            gl_FragColor = u_BackgroundColor;
        }
    }
    */
}