#version 300 es

in vec4 a_position;

uniform mat4 u_trans;

void main () {
  gl_Position = u_trans * a_position;
}
