#version 300 es
precision mediump float;

uniform vec4 u_color;
uniform sampler2D u_tex;

in vec2 o_TexCoord;

out vec4 o_color;

void main () {
  vec4 t = texture(u_tex, o_TexCoord);
  //TODO: Add blend modes
  o_color = t + u_color * t.a;
  o_color = t;
}
