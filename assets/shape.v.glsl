#version 300 es

in vec4 a_position;

uniform mat4 u_trans;

void main () {
  gl_Position = u_trans * vec4(a_position.x, -a_position.y, a_position.z, a_position.w);
}
