#version 300 es

in vec4 a_position;

void main () {
  gl_Position = vec4(a_position.x, -a_position.y, a_position.z, a_position.w);
}
