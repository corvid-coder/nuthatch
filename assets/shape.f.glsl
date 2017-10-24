#version 300 es
precision mediump float;

uniform vec4 u_color;
out vec4 o_color;

void main () {
  o_color = vec4(u_color);
}
