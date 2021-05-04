attribute vec4 a_Position;

uniform mat4 u_Transform;

varying vec4 v_Position;

void main(){
    gl_Position = u_Transform * a_Position;

    // Pass position to the fragment shader
    v_Position = a_Position;
}