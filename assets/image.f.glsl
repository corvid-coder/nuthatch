#version 300 es
precision mediump float;

uniform vec4 u_color;
uniform sampler2D u_tex;

in vec2 o_TexCoord;

out vec4 o_color;

void main () {
  o_color = texture(u_tex, o_TexCoord);
}
