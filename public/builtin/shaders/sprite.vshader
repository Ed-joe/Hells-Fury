attribute vec4 a_Position;
attribute vec2 a_TexCoord;

uniform mat4 u_Transform;
uniform vec2 u_texShift;
uniform vec2 u_texScale;

varying vec2 v_TexCoord;

void main(){
	gl_Position = u_Transform * a_Position;
	v_TexCoord = a_TexCoord*u_texScale + u_texShift;
}